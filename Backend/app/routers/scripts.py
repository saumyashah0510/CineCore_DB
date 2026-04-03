from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.script import ScriptCreate, ScriptUpdate, ScriptResponse

router = APIRouter(prefix="/scripts", tags=["Scripts"])


@router.get("/project/{project_id}", response_model=list[ScriptResponse])
async def get_scripts_for_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT s.*, per.full_name AS writer_name
        FROM cinecore.script s
        JOIN cinecore.person per ON per.person_id = s.written_by
        WHERE s.project_id = :pid
        ORDER BY s.version_no
    """), {"pid": project_id})
    return [dict(r) for r in result.mappings().all()]


@router.post("/", response_model=ScriptResponse, status_code=201)
async def create_script(payload: ScriptCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.script
                (project_id, version_no, written_by, submitted_date, status, notes, word_count)
            VALUES
                (:project_id, :version_no, :written_by, :submitted_date, :status, :notes, :word_count)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{script_id}", response_model=ScriptResponse)
async def update_script(script_id: int, payload: ScriptUpdate, db: AsyncSession = Depends(get_db)):
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["script_id"] = script_id
    try:
        result = await db.execute(
            text(f"UPDATE cinecore.script SET {set_clause} WHERE script_id = :script_id RETURNING *"),
            updates
        )
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Script not found")
        await db.commit()
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))