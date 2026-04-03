from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Contract(Base):
    __tablename__ = "contract"
    __table_args__ = {"schema": "cinecore"}

    contract_id:     Mapped[int]        = mapped_column(Integer, primary_key=True)
    person_id:       Mapped[int]        = mapped_column(ForeignKey("cinecore.person.person_id"), nullable=False)
    project_id:      Mapped[int]        = mapped_column(ForeignKey("cinecore.project.project_id"), nullable=False)
    role:            Mapped[str]        = mapped_column(String(50), nullable=False)
    character_name:  Mapped[str|None]   = mapped_column(String(150))
    contract_fee:    Mapped[Decimal]    = mapped_column(Numeric(15, 2), nullable=False)
    currency:        Mapped[str]        = mapped_column(String(10), default="INR")
    signing_date:    Mapped[date]       = mapped_column(Date, nullable=False)
    start_date:      Mapped[date]       = mapped_column(Date, nullable=False)
    end_date:        Mapped[date|None]  = mapped_column(Date)
    status:          Mapped[str]        = mapped_column(String(20), nullable=False)
    special_clauses: Mapped[str|None]   = mapped_column(Text)

    person:    Mapped["Person"]               = relationship("Person", back_populates="contracts")
    project:   Mapped["Project"]              = relationship("Project", back_populates="contracts")
    milestones:Mapped[list["PaymentMilestone"]]= relationship("PaymentMilestone", back_populates="contract")


class PaymentMilestone(Base):
    __tablename__ = "payment_milestone"
    __table_args__ = {"schema": "cinecore"}

    milestone_id:           Mapped[int]       = mapped_column(Integer, primary_key=True)
    contract_id:            Mapped[int]       = mapped_column(ForeignKey("cinecore.contract.contract_id"), nullable=False)
    milestone_name:         Mapped[str]       = mapped_column(String(100), nullable=False)
    due_date:               Mapped[date]      = mapped_column(Date, nullable=False)
    amount:                 Mapped[Decimal]   = mapped_column(Numeric(15, 2), nullable=False)
    paid_date:              Mapped[date|None] = mapped_column(Date)
    payment_status:         Mapped[str]       = mapped_column(String(20), nullable=False)
    transaction_reference_no: Mapped[str|None]= mapped_column(String(100), unique=True)

    contract: Mapped["Contract"] = relationship("Contract", back_populates="milestones")


class BudgetHead(Base):
    __tablename__ = "budget_head"
    __table_args__ = {"schema": "cinecore"}

    budget_head_id:   Mapped[int]      = mapped_column(Integer, primary_key=True)
    project_id:       Mapped[int]      = mapped_column(ForeignKey("cinecore.project.project_id"), nullable=False)
    category_name:    Mapped[str]      = mapped_column(String(100), nullable=False)
    allocated_amount: Mapped[Decimal]  = mapped_column(Numeric(15, 2), nullable=False)
    overspent_flag:   Mapped[bool]     = mapped_column(Boolean, default=False)
    head_of_department: Mapped[int|None] = mapped_column(ForeignKey("cinecore.person.person_id"))

    project:  Mapped["Project"]        = relationship("Project", back_populates="budget_heads")
    expenses: Mapped[list["Expense"]]  = relationship("Expense", back_populates="budget_head")


class Expense(Base):
    __tablename__ = "expense"
    __table_args__ = {"schema": "cinecore"}

    expense_id:     Mapped[int]       = mapped_column(Integer, primary_key=True)
    project_id:     Mapped[int]       = mapped_column(ForeignKey("cinecore.project.project_id"), nullable=False)
    budget_head_id: Mapped[int]       = mapped_column(ForeignKey("cinecore.budget_head.budget_head_id"), nullable=False)
    vendor_id:      Mapped[int]       = mapped_column(ForeignKey("cinecore.production_vendor.vendor_id"), nullable=False)
    description:    Mapped[str]       = mapped_column(Text, nullable=False)
    amount:         Mapped[Decimal]   = mapped_column(Numeric(15, 2), nullable=False)
    expense_date:   Mapped[date]      = mapped_column(Date, nullable=False)
    payment_mode:   Mapped[str|None]  = mapped_column(String(20))
    approved_by:    Mapped[int|None]  = mapped_column(ForeignKey("cinecore.person.person_id"))
    invoice_no:     Mapped[str|None]  = mapped_column(String(100), unique=True)
    status:         Mapped[str]       = mapped_column(String(20), nullable=False)

    budget_head: Mapped["BudgetHead"]      = relationship("BudgetHead", back_populates="expenses")
    vendor:      Mapped["ProductionVendor"]= relationship("ProductionVendor", back_populates="expenses")