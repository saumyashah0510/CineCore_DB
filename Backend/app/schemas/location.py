from datetime import date, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


# ------------------------------------------------------------------
# Location
# ------------------------------------------------------------------
class LocationCreate(BaseModel):
    location_name: str
    type: str                        # OUTDOOR | FOREIGN | INDOOR_SET
    address: str | None = None
    city: str
    state: str | None = None
    country: str
    contact_person: str
    contact_phone: str
    daily_rental_cost: Decimal | None = None
    facilities_available: str | None = None
    permits_required: bool
    permit_authority: str | None = None

class LocationResponse(LocationCreate):
    location_id: int
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------
# Shoot Schedule
# ------------------------------------------------------------------
class ShootScheduleCreate(BaseModel):
    project_id: int
    location_id: int
    schedule_date: date
    scene_nos: str
    call_time: time
    status: str = "PLANNED"
    director_notes: str | None = None

class ShootScheduleUpdate(BaseModel):
    status: str | None = None
    director_notes: str | None = None
    delay_reason: str | None = None

class ShootScheduleResponse(BaseModel):
    schedule_id: int
    project_id: int
    location_id: int
    schedule_date: date
    scene_nos: str
    call_time: time
    status: str
    director_notes: str | None
    delay_reason: str | None
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------
# Permit
# ------------------------------------------------------------------
class PermitCreate(BaseModel):
    project_id: int
    location_id: int
    issuing_authority: str
    permit_type: str                 # SHOOTING | PARKING | DRONE_FLIGHT | NIGHT_SHOOT
    application_date: date
    issued_date: date | None = None
    valid_from: date | None = None
    valid_to: date | None = None
    permit_fee: Decimal | None = None
    status: str = "APPLIED"

class PermitUpdate(BaseModel):
    issued_date: date | None = None
    valid_from: date | None = None
    valid_to: date | None = None
    status: str | None = None

class PermitResponse(BaseModel):
    permit_id: int
    project_id: int
    location_id: int
    issuing_authority: str
    permit_type: str
    application_date: date
    issued_date: date | None
    valid_from: date | None
    valid_to: date | None
    permit_fee: Decimal | None
    status: str
    model_config = ConfigDict(from_attributes=True)