from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OTTPlatform(Base):
    __tablename__ = "ott_platform"
    __table_args__ = {"schema": "cinecore"}

    ott_id:                    Mapped[int]        = mapped_column(Integer, primary_key=True)
    name:                      Mapped[str]        = mapped_column(String(100), nullable=False, unique=True)
    hq_country:                Mapped[str]        = mapped_column(String(100), nullable=False)
    subscriber_base_millions:  Mapped[Decimal|None]= mapped_column(Numeric(8, 2))
    contact_person:            Mapped[str]        = mapped_column(String(150), nullable=False)
    contact_email:             Mapped[str]        = mapped_column(String(150), nullable=False)

    deals: Mapped[list["OTTDeal"]] = relationship("OTTDeal", back_populates="platform")


class OTTDeal(Base):
    __tablename__ = "ott_deal"
    __table_args__ = {"schema": "cinecore"}

    deal_id:              Mapped[int]        = mapped_column(Integer, primary_key=True)
    project_id:           Mapped[int]        = mapped_column(ForeignKey("cinecore.project.project_id"), nullable=False)
    platform_id:          Mapped[int]        = mapped_column(ForeignKey("cinecore.ott_platform.ott_id"), nullable=False)
    deal_type:            Mapped[str]        = mapped_column(String(20), nullable=False)
    territory:            Mapped[str]        = mapped_column(String(200), nullable=False)
    license_fee:          Mapped[Decimal|None]= mapped_column(Numeric(15, 2))
    revenue_share_percent:Mapped[Decimal|None]= mapped_column(Numeric(5, 2))
    deal_signing_date:    Mapped[date]       = mapped_column(Date, nullable=False)
    streaming_start_date: Mapped[date]       = mapped_column(Date, nullable=False)
    deal_expiry_date:     Mapped[date]       = mapped_column(Date, nullable=False)
    languages:            Mapped[str|None]   = mapped_column(Text)

    platform: Mapped["OTTPlatform"] = relationship("OTTPlatform", back_populates="deals")


class TheatreRelease(Base):
    __tablename__ = "theatre_release"
    __table_args__ = {"schema": "cinecore"}

    theatre_release_id:        Mapped[int]        = mapped_column(Integer, primary_key=True)
    project_id:                Mapped[int]        = mapped_column(ForeignKey("cinecore.project.project_id"), nullable=False)
    city:                      Mapped[str]        = mapped_column(String(100), nullable=False)
    theatre_chain:             Mapped[str]        = mapped_column(String(100), nullable=False)
    no_of_screens:             Mapped[int]        = mapped_column(Integer, nullable=False)
    release_date:              Mapped[date]       = mapped_column(Date, nullable=False)
    opening_weekend_collection:Mapped[Decimal|None]= mapped_column(Numeric(15, 2))
    total_collection:          Mapped[Decimal|None]= mapped_column(Numeric(15, 2))
    weeks_running:             Mapped[int|None]   = mapped_column(Integer)