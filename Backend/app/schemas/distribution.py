from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


# ------------------------------------------------------------------
# OTT Platform
# ------------------------------------------------------------------
class OTTPlatformCreate(BaseModel):
    name: str
    hq_country: str
    subscriber_base_millions: Decimal | None = None
    contact_person: str
    contact_email: str

class OTTPlatformResponse(OTTPlatformCreate):
    ott_id: int
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------
# OTT Deal
# ------------------------------------------------------------------
class OTTDealCreate(BaseModel):
    project_id: int
    platform_id: int
    deal_type: str               # EXCLUSIVE | NON_EXCLUSIVE | OTT_PREMIERE
    territory: str
    license_fee: Decimal | None = None
    revenue_share_percent: Decimal | None = None
    deal_signing_date: date
    streaming_start_date: date
    deal_expiry_date: date
    languages: str | None = None

class OTTDealUpdate(BaseModel):
    license_fee: Decimal | None = None
    deal_expiry_date: date | None = None
    deal_type: str | None = None
    territory: str | None = None

class OTTDealResponse(OTTDealCreate):
    deal_id: int
    platform_name: str | None = None
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------
# Theatre Release
# ------------------------------------------------------------------
class TheatreReleaseCreate(BaseModel):
    project_id: int
    city: str
    theatre_chain: str
    no_of_screens: int
    release_date: date
    opening_weekend_collection: Decimal | None = None
    total_collection: Decimal | None = None
    weeks_running: int | None = None

class TheatreReleaseUpdate(BaseModel):
    opening_weekend_collection: Decimal | None = None
    total_collection: Decimal | None = None
    weeks_running: int | None = None
    no_of_screens: int | None = None

class TheatreReleaseResponse(TheatreReleaseCreate):
    theatre_release_id: int
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------
# OTT Deal Audit (read-only)
# ------------------------------------------------------------------
class OTTDealAuditResponse(BaseModel):
    audit_id: int
    deal_id: int
    operation: str
    changed_at: datetime
    old_license_fee: Decimal | None = None
    new_license_fee: Decimal | None = None
    old_territory: str | None = None
    new_territory: str | None = None
    old_deal_type: str | None = None
    new_deal_type: str | None = None
    old_expiry_date: date | None = None
    new_expiry_date: date | None = None
    model_config = ConfigDict(from_attributes=True)