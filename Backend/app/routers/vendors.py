from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import cache_get, cache_set, cache_delete_pattern, CACHE_TTL_LONG
from app.schemas.vendor import VendorCreate, VendorResponse

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.get("/", response_model=list[VendorResponse])
async def list_vendors(db: AsyncSession = Depends(get_db)):
    """
    Vendor list changes rarely — cache for 1 hour.
    Finance Manager uses this to pick vendors when recording expenses.
    """
    cache_key = "vendors:all"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT * FROM cinecore.production_vendor
        ORDER BY service_type, company_name
    """))
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_LONG)
    return data


@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM cinecore.production_vendor WHERE vendor_id = :id"),
        {"id": vendor_id}
    )
    row = result.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return dict(row)


@router.post("/", response_model=VendorResponse, status_code=201)
async def create_vendor(payload: VendorCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.production_vendor
                (company_name, service_type, gstin, contact_name, contact_phone,
                 contact_email, internal_rating, bank_account_no, bank_ifsc)
            VALUES
                (:company_name, :service_type, :gstin, :contact_name, :contact_phone,
                 :contact_email, :internal_rating, :bank_account_no, :bank_ifsc)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        await cache_delete_pattern("vendors:*")
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/by-service/{service_type}", response_model=list[VendorResponse])
async def get_vendors_by_service(service_type: str, db: AsyncSession = Depends(get_db)):
    """Filter vendors by service type. Useful in expense recording forms."""
    result = await db.execute(text("""
        SELECT * FROM cinecore.production_vendor
        WHERE service_type = :stype
        ORDER BY internal_rating DESC NULLS LAST, company_name
    """), {"stype": service_type.upper()})
    return [dict(r) for r in result.mappings().all()]