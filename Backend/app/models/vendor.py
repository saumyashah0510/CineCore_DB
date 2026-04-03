from sqlalchemy import Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProductionVendor(Base):
    __tablename__ = "production_vendor"
    __table_args__ = {"schema": "cinecore"}

    vendor_id:       Mapped[int]      = mapped_column(Integer, primary_key=True)
    company_name:    Mapped[str]      = mapped_column(String(200), nullable=False)
    service_type:    Mapped[str]      = mapped_column(String(100), nullable=False)
    gstin:           Mapped[str|None] = mapped_column(String(20), unique=True)
    contact_name:    Mapped[str]      = mapped_column(String(150), nullable=False)
    contact_phone:   Mapped[str]      = mapped_column(String(20), nullable=False)
    contact_email:   Mapped[str]      = mapped_column(String(150), nullable=False)
    internal_rating: Mapped[int|None] = mapped_column(Integer)
    bank_account_no: Mapped[str|None] = mapped_column(String(30), unique=True)
    bank_ifsc:       Mapped[str|None] = mapped_column(String(15))

    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="vendor")