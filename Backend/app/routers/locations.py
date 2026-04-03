from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import cache_get, cache_set, cache_delete_pattern, CACHE_TTL_LONG, CACHE_TTL_SHORT
from app.schemas.location import (
    LocationCreate, LocationResponse,
    ShootScheduleCreate, ShootScheduleUpdate, ShootScheduleResponse,
    PermitCreate, PermitUpdate, PermitResponse,
)

router = APIRouter(prefix="/locations", tags=["Locations"])


# ------------------------------------------------------------------
# Locations
# ------------------------------------------------------------------
@router.get("/", response_model=list[LocationResponse])
async def list_locations(db: AsyncSession = Depends(get_db)):
    cache_key = "locations:all"
    cached = await cache_get(cache_key)
    if cached:
        return cached
    result = await db.execute(text("SELECT * FROM cinecore.location ORDER BY city, location_name"))
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_LONG)
    return data


@router.post("/", response_model=LocationResponse, status_code=201)
async def create_location(payload: LocationCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.location
                (location_name, type, address, city, state, country,
                 contact_person, contact_phone, daily_rental_cost,
                 facilities_available, permits_required, permit_authority)
            VALUES
                (:location_name, :type, :address, :city, :state, :country,
                 :contact_person, :contact_phone, :daily_rental_cost,
                 :facilities_available, :permits_required, :permit_authority)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        await cache_delete_pattern("locations:*")
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ------------------------------------------------------------------
# Shoot Schedules
# ------------------------------------------------------------------
@router.get("/schedules/project/{project_id}", response_model=list[ShootScheduleResponse])
async def get_schedules_for_project(project_id: int, db: AsyncSession = Depends(get_db)):
    cache_key = f"schedules:project:{project_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT ss.*, l.location_name, l.city
        FROM cinecore.shoot_schedule ss
        JOIN cinecore.location l ON l.location_id = ss.location_id
        WHERE ss.project_id = :pid
        ORDER BY ss.schedule_date
    """), {"pid": project_id})
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_SHORT)
    return data


@router.post("/schedules/", response_model=ShootScheduleResponse, status_code=201)
async def create_schedule(payload: ShootScheduleCreate, db: AsyncSession = Depends(get_db)):
    """
    Trigger 4 (fn_prevent_location_double_booking) fires automatically on INSERT.
    If the location is already booked on that date by another project,
    the trigger raises an error which surfaces here as a 400.
    """
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.shoot_schedule
                (project_id, location_id, schedule_date, scene_nos, call_time, status, director_notes)
            VALUES
                (:project_id, :location_id, :schedule_date, :scene_nos, :call_time, :status, :director_notes)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        await cache_delete_pattern(f"schedules:project:{payload.project_id}")
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/schedules/{schedule_id}", response_model=ShootScheduleResponse)
async def update_schedule(schedule_id: int, payload: ShootScheduleUpdate, db: AsyncSession = Depends(get_db)):
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["schedule_id"] = schedule_id
    try:
        result = await db.execute(
            text(f"UPDATE cinecore.shoot_schedule SET {set_clause} WHERE schedule_id = :schedule_id RETURNING *"),
            updates
        )
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Schedule not found")
        await db.commit()
        await cache_delete_pattern(f"schedules:project:{row['project_id']}")
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ------------------------------------------------------------------
# Permits
# ------------------------------------------------------------------
@router.get("/permits/project/{project_id}", response_model=list[PermitResponse])
async def get_permits_for_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT pe.*, l.location_name
        FROM cinecore.permit pe
        JOIN cinecore.location l ON l.location_id = pe.location_id
        WHERE pe.project_id = :pid
        ORDER BY pe.application_date
    """), {"pid": project_id})
    return [dict(r) for r in result.mappings().all()]


@router.post("/permits/", response_model=PermitResponse, status_code=201)
async def create_permit(payload: PermitCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.permit
                (project_id, location_id, issuing_authority, permit_type,
                 application_date, issued_date, valid_from, valid_to, permit_fee, status)
            VALUES
                (:project_id, :location_id, :issuing_authority, :permit_type,
                 :application_date, :issued_date, :valid_from, :valid_to, :permit_fee, :status)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/permits/{permit_id}", response_model=PermitResponse)
async def update_permit(permit_id: int, payload: PermitUpdate, db: AsyncSession = Depends(get_db)):
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["permit_id"] = permit_id
    try:
        result = await db.execute(
            text(f"UPDATE cinecore.permit SET {set_clause} WHERE permit_id = :permit_id RETURNING *"),
            updates
        )
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Permit not found")
        await db.commit()
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))