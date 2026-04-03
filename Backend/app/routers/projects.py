from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import CACHE_TTL_MEDIUM, CACHE_TTL_SHORT, cache_delete_pattern, cache_get, cache_set
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectSummary, ProjectUpdate
from app.schemas.expense import BudgetOverviewItem
from app.schemas.analytics import OverduePayment

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=list[ProjectSummary])
async def list_projects(db: AsyncSession = Depends(get_db)):
    cache_key = "projects:all"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT
            p.project_id,
            p.title,
            ph.name                              AS production_house,
            p.status,
            p.total_budget,
            COUNT(DISTINCT c.contract_id)         AS contracts,
            COUNT(DISTINCT e.expense_id)          AS expenses,
            COUNT(DISTINCT s.song_id)             AS songs,
            COUNT(DISTINCT od.deal_id)            AS ott_deals,
            COUNT(DISTINCT tr.theatre_release_id) AS theatre_cities
        FROM cinecore.project p
        JOIN cinecore.production_house ph ON ph.house_id = p.house_id
        LEFT JOIN cinecore.contract c         ON c.project_id  = p.project_id
        LEFT JOIN cinecore.expense e          ON e.project_id  = p.project_id
        LEFT JOIN cinecore.song s             ON s.project_id  = p.project_id
        LEFT JOIN cinecore.ott_deal od        ON od.project_id = p.project_id
        LEFT JOIN cinecore.theatre_release tr ON tr.project_id = p.project_id
        GROUP BY p.project_id, p.title, ph.name, p.status, p.total_budget
        ORDER BY p.project_id
    """))
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_MEDIUM)
    return data


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    cache_key = f"projects:{project_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(
        text("SELECT * FROM cinecore.project WHERE project_id = :id"),
        {"id": project_id}
    )
    row = result.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    data = dict(row)
    await cache_set(cache_key, data, CACHE_TTL_SHORT)
    return data


@router.post("/", response_model=dict, status_code=201)
async def create_project(payload: ProjectCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            SELECT * FROM (
                CALL cinecore.sp_create_project(
                    :title, :house_id, :genre, :language, :format,
                    :total_budget, :start_date, :expected_release, NULL
                )
            ) AS result
        """), {
            "title":           payload.title,
            "house_id":        payload.house_id,
            "genre":           payload.genre,
            "language":        payload.language,
            "format":          payload.format,
            "total_budget":    float(payload.total_budget),
            "start_date":      payload.start_date,
            "expected_release":payload.expected_release_date,
        })
        row = result.mappings().first()
        new_id = row["p_project_id"] if row else None
        await db.commit()
        await cache_delete_pattern("projects:*")
        return {"project_id": new_id, "message": "Project created with 6 budget heads"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, payload: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    # Build SET clause dynamically from only provided fields
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["project_id"] = project_id

    try:
        result = await db.execute(
            text(f"UPDATE cinecore.project SET {set_clause} WHERE project_id = :project_id RETURNING *"),
            updates
        )
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        await db.commit()
        await cache_delete_pattern(f"projects:{project_id}")
        await cache_delete_pattern("projects:all")
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{project_id}/budget", response_model=list[BudgetOverviewItem])
async def get_project_budget(project_id: int, db: AsyncSession = Depends(get_db)):
    cache_key = f"projects:{project_id}:budget"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT
            bh.budget_head_id,
            p.title          AS project_title,
            bh.category_name,
            bh.allocated_amount,
            COALESCE(SUM(e.amount) FILTER (WHERE e.status IN ('APPROVED','PAID')), 0) AS total_spent,
            bh.overspent_flag
        FROM cinecore.budget_head bh
        JOIN cinecore.project p ON p.project_id = bh.project_id
        LEFT JOIN cinecore.expense e ON e.budget_head_id = bh.budget_head_id
        WHERE bh.project_id = :pid
        GROUP BY bh.budget_head_id, p.title, bh.category_name, bh.allocated_amount, bh.overspent_flag
        ORDER BY bh.budget_head_id
    """), {"pid": project_id})

    rows = result.mappings().all()
    if not rows:
        raise HTTPException(status_code=404, detail="Project not found")

    data = [dict(r) for r in rows]
    await cache_set(cache_key, data, 60)
    return data


@router.get("/{project_id}/overdue-payments", response_model=list[OverduePayment])
async def get_overdue_payments(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT
            pm.milestone_id,
            per.full_name                     AS person_name,
            pr.title                          AS project_title,
            pm.milestone_name,
            pm.amount,
            pm.due_date,
            (CURRENT_DATE - pm.due_date)::int AS days_overdue
        FROM cinecore.payment_milestone pm
        JOIN cinecore.contract c  ON c.contract_id = pm.contract_id
        JOIN cinecore.person per  ON per.person_id  = c.person_id
        JOIN cinecore.project pr  ON pr.project_id  = c.project_id
        WHERE c.project_id = :pid AND pm.payment_status = 'OVERDUE'
        ORDER BY pm.due_date ASC
    """), {"pid": project_id})
    return [dict(r) for r in result.mappings().all()]