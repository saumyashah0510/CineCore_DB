from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import cache_get, cache_set, cache_delete_pattern, CACHE_TTL_LONG
from app.schemas.person import PersonCreate, PersonResponse

router = APIRouter(prefix="/persons", tags=["Persons"])


@router.get("/", response_model=list[PersonResponse])
async def list_persons(db: AsyncSession = Depends(get_db)):
    cache_key = "persons:all"
    cached = await cache_get(cache_key)
    if cached:
        return cached
    result = await db.execute(text("SELECT * FROM cinecore.person ORDER BY full_name"))
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_LONG)
    return data


@router.get("/{person_id}", response_model=PersonResponse)
async def get_person(person_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM cinecore.person WHERE person_id = :id"), {"id": person_id})
    row = result.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Person not found")
    return dict(row)


@router.post("/", response_model=PersonResponse, status_code=201)
async def create_person(payload: PersonCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.person
                (full_name, screen_name, nationality, dob, gender,
                 primary_profession, pan_no, contact_email, contact_phone,
                 agent_name, agent_contact)
            VALUES
                (:full_name, :screen_name, :nationality, :dob, :gender,
                 :primary_profession, :pan_no, :contact_email, :contact_phone,
                 :agent_name, :agent_contact)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        await cache_delete_pattern("persons:*")
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{person_id}/contracts")
async def get_person_contracts(person_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT c.*, p.title AS project_title, p.status AS project_status
        FROM cinecore.contract c
        JOIN cinecore.project p ON p.project_id = c.project_id
        WHERE c.person_id = :pid
        ORDER BY c.signing_date DESC
    """), {"pid": person_id})
    return [dict(r) for r in result.mappings().all()]