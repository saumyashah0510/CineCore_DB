from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import cache_delete_pattern
from app.schemas.expense import ExpenseCreate, ExpenseResponse, BudgetHeadUpdate, BudgetHeadResponse

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("/project/{project_id}", response_model=list[ExpenseResponse])
async def get_expenses_for_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT * FROM cinecore.expense
        WHERE project_id = :pid
        ORDER BY expense_date DESC
    """), {"pid": project_id})
    return [dict(r) for r in result.mappings().all()]


@router.post("/", response_model=dict, status_code=201)
async def record_expense(payload: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            SELECT * FROM (
                CALL cinecore.sp_record_expense(
                    :project_id, :budget_head_id, :vendor_id,
                    :description, :amount, :expense_date,
                    :payment_mode, :invoice_no, NULL
                )
            ) AS result
        """), {
            "project_id":     payload.project_id,
            "budget_head_id": payload.budget_head_id,
            "vendor_id":      payload.vendor_id,
            "description":    payload.description,
            "amount":         float(payload.amount),
            "expense_date":   payload.expense_date,
            "payment_mode":   payload.payment_mode,
            "invoice_no":     payload.invoice_no,
        })
        row = result.mappings().first()
        new_id = row["p_expense_id"] if row else None
        await db.commit()
        await cache_delete_pattern(f"projects:{payload.project_id}:budget")
        return {"expense_id": new_id, "message": "Expense recorded (status: PENDING)"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{expense_id}/approve")
async def approve_expense(expense_id: int, approved_by: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            UPDATE cinecore.expense
            SET status = 'APPROVED', approved_by = :approved_by
            WHERE expense_id = :eid
            RETURNING project_id
        """), {"eid": expense_id, "approved_by": approved_by})
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Expense not found")
        await db.commit()
        await cache_delete_pattern(f"projects:{row['project_id']}:budget")
        return {"message": "Expense approved. Budget flags updated by DB trigger."}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/budget-head/{budget_head_id}", response_model=BudgetHeadResponse)
async def update_budget_head(budget_head_id: int, payload: BudgetHeadUpdate, db: AsyncSession = Depends(get_db)):
    """Adjust allocated amount or assign head of department."""
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["budget_head_id"] = budget_head_id

    try:
        result = await db.execute(
            text(f"UPDATE cinecore.budget_head SET {set_clause} WHERE budget_head_id = :budget_head_id RETURNING *"),
            updates
        )
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Budget head not found")
        await db.commit()
        await cache_delete_pattern(f"projects:{row['project_id']}:budget")
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))