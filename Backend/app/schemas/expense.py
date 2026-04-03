from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ExpenseCreate(BaseModel):
    project_id: int
    budget_head_id: int
    vendor_id: int
    description: str
    amount: Decimal
    expense_date: date
    payment_mode: str
    invoice_no: str | None = None

class ExpenseResponse(BaseModel):
    expense_id: int
    project_id: int
    budget_head_id: int
    vendor_id: int
    description: str
    amount: Decimal
    expense_date: date
    payment_mode: str | None
    approved_by: int | None
    invoice_no: str | None
    status: str
    model_config = ConfigDict(from_attributes=True)


class BudgetHeadResponse(BaseModel):
    budget_head_id: int
    project_id: int
    category_name: str
    allocated_amount: Decimal
    overspent_flag: bool
    head_of_department: int | None
    model_config = ConfigDict(from_attributes=True)

class BudgetHeadUpdate(BaseModel):
    allocated_amount: Decimal | None = None
    head_of_department: int | None = None

class BudgetOverviewItem(BaseModel):
    """Used in analytics — includes computed total_spent"""
    budget_head_id: int
    project_title: str
    category_name: str
    allocated_amount: Decimal
    total_spent: Decimal
    overspent_flag: bool