from datetime import date
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OTTDealAudit(Base):
    """
    Audit log for OTT_Deal changes.
    Populated automatically by Trigger 3 (trg_ott_deal_audit).
    This table is READ-ONLY from the application side —
    never insert into it directly, the trigger handles that.
    """
    __tablename__ = "ott_deal_audit"
    __table_args__ = {"schema": "cinecore"}

    audit_id:        Mapped[int]         = mapped_column(Integer, primary_key=True)
    deal_id:         Mapped[int]         = mapped_column(Integer, nullable=False)
    # Not a FK because audit rows must survive even if the deal is deleted
    operation:       Mapped[str]         = mapped_column(String(10), nullable=False)
    # INSERT | UPDATE | DELETE
    changed_at:      Mapped[str]         = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Snapshot of values before and after the change
    old_license_fee: Mapped[Decimal|None]= mapped_column(Numeric(15, 2))
    new_license_fee: Mapped[Decimal|None]= mapped_column(Numeric(15, 2))
    old_territory:   Mapped[str|None]    = mapped_column(String(200))
    new_territory:   Mapped[str|None]    = mapped_column(String(200))
    old_deal_type:   Mapped[str|None]    = mapped_column(String(20))
    new_deal_type:   Mapped[str|None]    = mapped_column(String(20))
    old_expiry_date: Mapped[date|None]   = mapped_column(String(20))
    new_expiry_date: Mapped[date|None]   = mapped_column(String(20))