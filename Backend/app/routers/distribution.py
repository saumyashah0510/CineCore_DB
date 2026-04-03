from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import cache_get, cache_set, cache_delete_pattern, CACHE_TTL_MEDIUM, CACHE_TTL_LONG
from app.schemas.distribution import (
    OTTPlatformCreate, OTTPlatformResponse,
    OTTDealCreate, OTTDealUpdate, OTTDealResponse,
    TheatreReleaseCreate, TheatreReleaseUpdate, TheatreReleaseResponse,
    OTTDealAuditResponse,
)

router = APIRouter(prefix="/distribution", tags=["Distribution"])


# ------------------------------------------------------------------
# OTT Platforms
# ------------------------------------------------------------------
@router.get("/platforms", response_model=list[OTTPlatformResponse])
async def list_platforms(db: AsyncSession = Depends(get_db)):
    cache_key = "platforms:all"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT * FROM cinecore.ott_platform ORDER BY name
    """))
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_LONG)
    return data


@router.post("/platforms", response_model=OTTPlatformResponse, status_code=201)
async def create_platform(payload: OTTPlatformCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.ott_platform
                (name, hq_country, subscriber_base_millions, contact_person, contact_email)
            VALUES
                (:name, :hq_country, :subscriber_base_millions, :contact_person, :contact_email)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        await cache_delete_pattern("platforms:*")
        await cache_delete_pattern("analytics:*")
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ------------------------------------------------------------------
# OTT Deals
# Trigger 3 (trg_ott_deal_audit) fires automatically on INSERT/UPDATE/DELETE
# ------------------------------------------------------------------
@router.get("/deals/project/{project_id}", response_model=list[OTTDealResponse])
async def get_deals_for_project(project_id: int, db: AsyncSession = Depends(get_db)):
    cache_key = f"deals:project:{project_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT od.*, op.name AS platform_name
        FROM cinecore.ott_deal od
        JOIN cinecore.ott_platform op ON op.ott_id = od.platform_id
        WHERE od.project_id = :pid
        ORDER BY od.deal_signing_date DESC
    """), {"pid": project_id})
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_MEDIUM)
    return data


@router.post("/deals", response_model=OTTDealResponse, status_code=201)
async def create_deal(payload: OTTDealCreate, db: AsyncSession = Depends(get_db)):
    """
    INSERT fires Trigger 3 → audit row created automatically.
    """
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.ott_deal
                (project_id, platform_id, deal_type, territory, license_fee,
                 revenue_share_percent, deal_signing_date, streaming_start_date,
                 deal_expiry_date, languages)
            VALUES
                (:project_id, :platform_id, :deal_type, :territory, :license_fee,
                 :revenue_share_percent, :deal_signing_date, :streaming_start_date,
                 :deal_expiry_date, :languages)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        await cache_delete_pattern(f"deals:project:{payload.project_id}")
        await cache_delete_pattern("analytics:*")
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/deals/{deal_id}", response_model=OTTDealResponse)
async def update_deal(deal_id: int, payload: OTTDealUpdate, db: AsyncSession = Depends(get_db)):
    """
    UPDATE fires Trigger 3 → audit row records old vs new values automatically.
    """
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["deal_id"] = deal_id

    try:
        result = await db.execute(
            text(f"UPDATE cinecore.ott_deal SET {set_clause} WHERE deal_id = :deal_id RETURNING *"),
            updates
        )
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Deal not found")
        await db.commit()
        await cache_delete_pattern(f"deals:project:{row['project_id']}")
        await cache_delete_pattern("analytics:*")
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/deals/{deal_id}", status_code=204)
async def delete_deal(deal_id: int, db: AsyncSession = Depends(get_db)):
    """
    DELETE fires Trigger 3 → audit row records the deletion automatically.
    """
    try:
        result = await db.execute(text("""
            DELETE FROM cinecore.ott_deal
            WHERE deal_id = :did
            RETURNING project_id
        """), {"did": deal_id})
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Deal not found")
        await db.commit()
        await cache_delete_pattern(f"deals:project:{row['project_id']}")
        await cache_delete_pattern("analytics:*")
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ------------------------------------------------------------------
# OTT Deal Audit Log — read-only, populated by Trigger 3
# ------------------------------------------------------------------
@router.get("/deals/{deal_id}/audit", response_model=list[OTTDealAuditResponse])
async def get_deal_audit(deal_id: int, db: AsyncSession = Depends(get_db)):
    """Full change history for a specific deal."""
    result = await db.execute(text("""
        SELECT * FROM cinecore.ott_deal_audit
        WHERE deal_id = :did
        ORDER BY changed_at DESC
    """), {"did": deal_id})
    return [dict(r) for r in result.mappings().all()]


@router.get("/audit/all", response_model=list[OTTDealAuditResponse])
async def get_all_audit_logs(db: AsyncSession = Depends(get_db)):
    """All audit entries across all deals. Admin view."""
    result = await db.execute(text("""
        SELECT a.*, od.project_id
        FROM cinecore.ott_deal_audit a
        LEFT JOIN cinecore.ott_deal od ON od.deal_id = a.deal_id
        ORDER BY a.changed_at DESC
        LIMIT 200
    """))
    return [dict(r) for r in result.mappings().all()]


# ------------------------------------------------------------------
# Theatre Releases
# ------------------------------------------------------------------
@router.get("/theatre/project/{project_id}", response_model=list[TheatreReleaseResponse])
async def get_theatre_releases_for_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT * FROM cinecore.theatre_release
        WHERE project_id = :pid
        ORDER BY total_collection DESC NULLS LAST
    """), {"pid": project_id})
    return [dict(r) for r in result.mappings().all()]


@router.post("/theatre", response_model=TheatreReleaseResponse, status_code=201)
async def create_theatre_release(payload: TheatreReleaseCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.theatre_release
                (project_id, city, theatre_chain, no_of_screens, release_date,
                 opening_weekend_collection, total_collection, weeks_running)
            VALUES
                (:project_id, :city, :theatre_chain, :no_of_screens, :release_date,
                 :opening_weekend_collection, :total_collection, :weeks_running)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        await cache_delete_pattern("analytics:*")
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/theatre/{release_id}", response_model=TheatreReleaseResponse)
async def update_theatre_release(release_id: int, payload: TheatreReleaseUpdate, db: AsyncSession = Depends(get_db)):
    """Update box office collection figures as they come in weekly."""
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["release_id"] = release_id

    try:
        result = await db.execute(
            text(f"UPDATE cinecore.theatre_release SET {set_clause} WHERE theatre_release_id = :release_id RETURNING *"),
            updates
        )
        row = result.mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Theatre release not found")
        await db.commit()
        await cache_delete_pattern("analytics:*")
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))