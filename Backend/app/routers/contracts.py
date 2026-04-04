from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import cache_delete_pattern, cache_get, cache_set, CACHE_TTL_SHORT
from app.schemas.contract import ContractCreate, ContractResponse, PaymentMilestoneResponse, PaymentMilestoneUpdate

router = APIRouter(prefix="/contracts", tags=["Contracts"])

# ── 1. ADDED MISSING GLOBAL GET ROUTE (For the React Table) ──
@router.get("/")
async def list_contracts(db: AsyncSession = Depends(get_db)):
    """Fetches all contracts globally and joins names/titles for the frontend table."""
    result = await db.execute(text("""
        SELECT c.*, p.full_name as person_name, pr.title as project_title
        FROM cinecore.contract c
        JOIN cinecore.person p ON c.person_id = p.person_id
        JOIN cinecore.project pr ON c.project_id = pr.project_id
        ORDER BY c.signing_date DESC
    """))
    return [dict(r) for r in result.mappings().all()]


@router.get("/project/{project_id}", response_model=list[ContractResponse])
async def get_contracts_for_project(project_id: int, db: AsyncSession = Depends(get_db)):
    cache_key = f"contracts:project:{project_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT c.* FROM cinecore.contract c
        WHERE c.project_id = :pid
        ORDER BY c.contract_id
    """), {"pid": project_id})

    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_SHORT)
    return data


@router.post("/", response_model=dict, status_code=201)
async def sign_contract(payload: ContractCreate, db: AsyncSession = Depends(get_db)):
    try:
        # ── 2. FIXED SQL SYNTAX: Removed 'SELECT * FROM () AS result' ──
        result = await db.execute(text("""
            CALL cinecore.sp_sign_contract(
                :person_id, :project_id, :role, :character_name,
                :contract_fee, :signing_date, :start_date, :end_date, NULL
            )
        """), {
            "person_id":      payload.person_id,
            "project_id":     payload.project_id,
            "role":           payload.role,
            "character_name": payload.character_name,
            "contract_fee":   float(payload.contract_fee),
            "signing_date":   payload.signing_date,
            "start_date":     payload.start_date,
            "end_date":       payload.end_date,
        })
        row = result.mappings().first()
        new_id = row["p_contract_id"] if row else None
        
        await db.commit()
        await cache_delete_pattern(f"contracts:project:{payload.project_id}")
        return {"contract_id": new_id, "message": "Contract signed. 3 payment milestones auto-created."}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{contract_id}/milestones", response_model=list[PaymentMilestoneResponse])
async def get_milestones(contract_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT pm.*
        FROM cinecore.payment_milestone pm
        WHERE pm.contract_id = :cid
        ORDER BY pm.due_date
    """), {"cid": contract_id})
    return [dict(r) for r in result.mappings().all()]


@router.patch("/{milestone_id}/pay", response_model=dict)
async def mark_milestone_paid(milestone_id: int, payload: PaymentMilestoneUpdate, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Update the milestone
        result = await db.execute(text("""
            UPDATE cinecore.payment_milestone
            SET payment_status = 'PAID',
                paid_date = :paid_date,
                transaction_reference_no = :txn_ref
            WHERE milestone_id = :mid
            RETURNING contract_id
        """), {"mid": milestone_id, "paid_date": payload.paid_date, "txn_ref": payload.transaction_reference_no})

        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Milestone not found")

        # 2. Get the Project ID associated with this contract to clear its specific cache
        project_result = await db.execute(text("""
            SELECT project_id FROM cinecore.contract WHERE contract_id = :cid
        """), {"cid": row["contract_id"]})
        project_id = project_result.scalar()

        await db.commit()

        # 3. CRITICAL: Clear all project-related caches so the dashboard updates!
        await cache_delete_pattern("projects:*")
        await cache_delete_pattern(f"contracts:project:{project_id}")
        
        return {"message": "Milestone marked as PAID and dashboard cache cleared"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))