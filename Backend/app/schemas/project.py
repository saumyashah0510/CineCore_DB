from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProjectBase(BaseModel):
    title: str
    house_id: int
    genre: str
    language: str
    format: str
    total_budget: Decimal
    start_date: date
    expected_release_date: date | None = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: str | None = None
    genre: str | None = None
    language: str | None = None
    status: str | None = None
    expected_release_date: date | None = None
    runtime_minutes: int | None = None

class ProjectResponse(ProjectBase):
    project_id: int
    status: str
    actual_release_date: date | None = None
    censor_certificate_no: str | None = None
    censor_rating: str | None = None
    runtime_minutes: int | None = None
    model_config = ConfigDict(from_attributes=True)

class ProjectSummary(BaseModel):
    project_id: int
    title: str
    production_house: str
    status: str
    total_budget: float
    total_used: float  # For the progress bars
    expenses: int
    overspent_flag: bool
    contracts: int     # <--- Required by validation
    songs: int         # <--- Required by validation
    ott_deals: int     # <--- Required by validation
    theatre_cities: int # <--- Required by validation

    model_config = ConfigDict(from_attributes=True)