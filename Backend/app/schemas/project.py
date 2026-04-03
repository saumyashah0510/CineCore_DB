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
    total_budget: Decimal
    contracts: int
    expenses: int
    songs: int
    ott_deals: int
    theatre_cities: int