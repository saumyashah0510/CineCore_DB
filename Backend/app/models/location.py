from datetime import date, time

from sqlalchemy import (
    Boolean, Date, ForeignKey, Integer,
    Numeric, String, Text, Time, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Location(Base):
    __tablename__ = "location"
    __table_args__ = {"schema": "cinecore"}

    location_id:        Mapped[int]        = mapped_column(Integer, primary_key=True)
    location_name:      Mapped[str]        = mapped_column(String(200), nullable=False)
    type:               Mapped[str]        = mapped_column(String(30), nullable=False)
    # OUTDOOR | FOREIGN | INDOOR_SET
    address:            Mapped[str|None]   = mapped_column(Text)
    city:               Mapped[str]        = mapped_column(String(100), nullable=False)
    state:              Mapped[str|None]   = mapped_column(String(100))
    country:            Mapped[str]        = mapped_column(String(100), nullable=False)
    contact_person:     Mapped[str]        = mapped_column(String(150), nullable=False)
    contact_phone:      Mapped[str]        = mapped_column(String(20), nullable=False)
    daily_rental_cost:  Mapped[float|None] = mapped_column(Numeric(12, 2))
    facilities_available: Mapped[str|None] = mapped_column(Text)
    permits_required:   Mapped[bool]       = mapped_column(Boolean, nullable=False)
    permit_authority:   Mapped[str|None]   = mapped_column(String(200))

    schedules: Mapped[list["ShootSchedule"]] = relationship("ShootSchedule", back_populates="location")
    permits:   Mapped[list["Permit"]]        = relationship("Permit",        back_populates="location")


class ShootSchedule(Base):
    __tablename__ = "shoot_schedule"
    __table_args__ = (
        UniqueConstraint("project_id", "schedule_date", "location_id",
                         name="uq_schedule_project_date_location"),
        {"schema": "cinecore"},
    )

    schedule_id:    Mapped[int]      = mapped_column(Integer, primary_key=True)
    project_id:     Mapped[int]      = mapped_column(ForeignKey("cinecore.project.project_id"),  nullable=False)
    location_id:    Mapped[int]      = mapped_column(ForeignKey("cinecore.location.location_id"), nullable=False)
    schedule_date:  Mapped[date]     = mapped_column(Date, nullable=False)
    scene_nos:      Mapped[str]      = mapped_column(String(200), nullable=False)
    call_time:      Mapped[time]     = mapped_column(Time, nullable=False)
    status:         Mapped[str]      = mapped_column(String(20), nullable=False)
    # PLANNED | COMPLETED | CANCELLED | POSTPONED
    director_notes: Mapped[str|None] = mapped_column(Text)
    delay_reason:   Mapped[str|None] = mapped_column(Text)

    project:  Mapped["Project"]  = relationship("Project",  foreign_keys=[project_id])
    location: Mapped["Location"] = relationship("Location", back_populates="schedules")


class Permit(Base):
    __tablename__ = "permit"
    __table_args__ = {"schema": "cinecore"}

    permit_id:         Mapped[int]        = mapped_column(Integer, primary_key=True)
    project_id:        Mapped[int]        = mapped_column(ForeignKey("cinecore.project.project_id"),  nullable=False)
    location_id:       Mapped[int]        = mapped_column(ForeignKey("cinecore.location.location_id"), nullable=False)
    issuing_authority: Mapped[str]        = mapped_column(String(200), nullable=False)
    permit_type:       Mapped[str]        = mapped_column(String(50), nullable=False)
    # SHOOTING | PARKING | DRONE_FLIGHT | NIGHT_SHOOT
    application_date:  Mapped[date]       = mapped_column(Date, nullable=False)
    issued_date:       Mapped[date|None]  = mapped_column(Date)
    valid_from:        Mapped[date|None]  = mapped_column(Date)
    valid_to:          Mapped[date|None]  = mapped_column(Date)
    permit_fee:        Mapped[float|None] = mapped_column(Numeric(10, 2))
    status:            Mapped[str]        = mapped_column(String(20), nullable=False)
    # APPLIED | APPROVED | REJECTED | EXPIRED

    project:  Mapped["Project"]  = relationship("Project",  foreign_keys=[project_id])
    location: Mapped["Location"] = relationship("Location", back_populates="permits")