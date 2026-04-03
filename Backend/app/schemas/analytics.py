from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_projects: int
    projects_shooting: int
    projects_released: int
    active_contracts: int
    overdue_payments: int
    overspent_heads: int
    total_box_office: Decimal
    total_ott_revenue: Decimal

class OverduePayment(BaseModel):
    milestone_id: int
    person_name: str
    project_title: str
    milestone_name: str
    amount: Decimal
    due_date: date
    days_overdue: int

class BoxOfficeRow(BaseModel):
    title: str
    city: str
    theatre_chain: str
    no_of_screens: int
    release_date: date
    opening_weekend_collection: Decimal | None
    total_collection: Decimal | None
    weeks_running: int | None

class OTTDealRow(BaseModel):
    project_title: str
    platform: str
    deal_type: str
    territory: str
    license_fee: Decimal | None
    streaming_start_date: date
    deal_expiry_date: date

class HouseStats(BaseModel):
    house_id: int
    name: str
    headquarter_city: str
    total_projects: int
    released: int
    total_box_office: Decimal
    total_ott_revenue: Decimal