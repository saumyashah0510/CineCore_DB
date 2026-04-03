from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Project(Base):
    __tablename__ = "project"
    __table_args__ = {"schema": "cinecore"}

    project_id:             Mapped[int]        = mapped_column(Integer, primary_key=True)
    title:                  Mapped[str]        = mapped_column(String(200), nullable=False)
    house_id:               Mapped[int]        = mapped_column(ForeignKey("cinecore.production_house.house_id"), nullable=False)
    genre:                  Mapped[str]        = mapped_column(String(100), nullable=False)
    language:               Mapped[str]        = mapped_column(String(100), nullable=False)
    format:                 Mapped[str]        = mapped_column(String(50), nullable=False)
    total_budget:           Mapped[float]      = mapped_column(Numeric(15, 2), nullable=False)
    status:                 Mapped[str]        = mapped_column(String(30), nullable=False)
    start_date:             Mapped[date]       = mapped_column(Date, nullable=False)
    expected_release_date:  Mapped[date|None]  = mapped_column(Date)
    actual_release_date:    Mapped[date|None]  = mapped_column(Date)
    censor_certificate_no:  Mapped[str|None]   = mapped_column(String(50), unique=True)
    censor_rating:          Mapped[str|None]   = mapped_column(String(5))
    runtime_minutes:        Mapped[int|None]   = mapped_column(Integer)

    # Relationships
    house:        Mapped["ProductionHouse"]     = relationship("ProductionHouse", back_populates="projects")
    contracts:    Mapped[list["Contract"]]      = relationship("Contract",      back_populates="project")
    budget_heads: Mapped[list["BudgetHead"]]    = relationship("BudgetHead",    back_populates="project")
    songs:        Mapped[list["Song"]]          = relationship("Song",          back_populates="project")
    scripts:      Mapped[list["Script"]]        = relationship("Script",        back_populates="project")
    schedules:    Mapped[list["ShootSchedule"]] = relationship("ShootSchedule", back_populates="project")
    permits:      Mapped[list["Permit"]]        = relationship("Permit",        back_populates="project")