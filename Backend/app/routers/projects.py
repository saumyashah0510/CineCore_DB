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
            ph.name AS production_house, 
            p.status, 
            p.total_budget,
            -- 1. Actual Spending (Aggregated for Dashboard)
            (
                COALESCE((SELECT SUM(amount) FROM cinecore.expense WHERE project_id = p.project_id AND status = 'APPROVED'), 0) +
                COALESCE((SELECT SUM(pm.amount) FROM cinecore.payment_milestone pm 
                          JOIN cinecore.contract c ON c.contract_id = pm.contract_id 
                          WHERE c.project_id = p.project_id AND pm.payment_status = 'PAID'), 0)
            ) AS total_used,
            -- 2. Required Schema Fields (Missing in your current error)
            (SELECT COUNT(*) FROM cinecore.contract WHERE project_id = p.project_id)::int AS contracts,
            (SELECT COUNT(*) FROM cinecore.song WHERE project_id = p.project_id)::int AS songs,
            (SELECT COUNT(*) FROM cinecore.ott_deal WHERE project_id = p.project_id)::int AS ott_deals,
            (SELECT COUNT(*) FROM cinecore.theatre_release WHERE project_id = p.project_id)::int AS theatre_cities,
            -- 3. Additional Metadata
            COUNT(DISTINCT e.expense_id)::int AS expenses,
            COALESCE(EXISTS(SELECT 1 FROM cinecore.budget_head bh WHERE bh.project_id = p.project_id AND bh.overspent_flag = TRUE), FALSE) AS overspent_flag
        FROM cinecore.project p
        JOIN cinecore.production_house ph ON p.house_id = ph.house_id
        LEFT JOIN cinecore.expense e ON e.project_id = p.project_id
        GROUP BY p.project_id, ph.name
        ORDER BY p.project_id DESC
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
        # FIX: Removed the "SELECT * FROM () AS result" wrapper.
        # Now it just directly CALLs the procedure!
        result = await db.execute(text("""
            CALL cinecore.sp_create_project(
                :title, :house_id, :genre, :language, :format,
                :total_budget, :start_date, :expected_release, NULL
            )
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
        
        # asyncpg handles OUT parameters by returning them as a row from the CALL statement
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


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Manually delete the auto-created budget heads first (fixes the FK constraint)
        await db.execute(
            text("DELETE FROM cinecore.budget_head WHERE project_id = :id"),
            {"id": project_id}
        )
        
        # 2. Now delete the actual project
        result = await db.execute(
            text("DELETE FROM cinecore.project WHERE project_id = :id RETURNING project_id"),
            {"id": project_id}
        )
        
        if not result.first():
            raise HTTPException(status_code=404, detail="Project not found")
            
        await db.commit()
        await cache_delete_pattern("projects:*") # Clear cache so React updates
        return None
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    

@router.get("/{project_id}/overruns", response_model=list[str])
async def get_project_overruns(project_id: int, db: AsyncSession = Depends(get_db)):
    """Returns a list of department names that have exceeded their budget."""
    result = await db.execute(text("""
        SELECT category_name 
        FROM cinecore.budget_head 
        WHERE project_id = :pid AND overspent_flag = TRUE
    """), {"pid": project_id})
    
    return [r[0] for r in result.all()]    