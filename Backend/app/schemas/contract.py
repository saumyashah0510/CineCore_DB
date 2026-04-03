from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ContractCreate(BaseModel):
    person_id: int
    project_id: int
    role: str
    character_name: str | None = None
    contract_fee: Decimal
    signing_date: date
    start_date: date
    end_date: date | None = None
    special_clauses: str | None = None

class ContractResponse(BaseModel):
    contract_id: int
    person_id: int
    project_id: int
    role: str
    character_name: str | None
    contract_fee: Decimal
    currency: str
    signing_date: date
    start_date: date
    end_date: date | None
    status: str
    special_clauses: str | None = None
    model_config = ConfigDict(from_attributes=True)


class PaymentMilestoneResponse(BaseModel):
    milestone_id: int
    contract_id: int
    milestone_name: str
    due_date: date
    amount: Decimal
    paid_date: date | None
    payment_status: str
    transaction_reference_no: str | None
    model_config = ConfigDict(from_attributes=True)

class PaymentMilestoneUpdate(BaseModel):
    """Mark a milestone as paid"""
    paid_date: date
    transaction_reference_no: str