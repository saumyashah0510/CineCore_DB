from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProductionHouse(Base):
    __tablename__ = "production_house"
    __table_args__ = {"schema": "cinecore"}   # your PostgreSQL schema name

    house_id:            Mapped[int]         = mapped_column(Integer, primary_key=True)
    name:                Mapped[str]         = mapped_column(String(150), nullable=False)
    founded_year:        Mapped[int | None]  = mapped_column(Integer)
    headquarter_city:    Mapped[str]         = mapped_column(String(100), nullable=False)
    headquarter_country: Mapped[str]         = mapped_column(String(100), nullable=False)
    gstin:               Mapped[str | None]  = mapped_column(String(20), unique=True)
    website:             Mapped[str | None]  = mapped_column(String(200))
    contact_email:       Mapped[str]         = mapped_column(String(150), nullable=False)

    # Relationship — lets you do house.projects to get all projects
    projects: Mapped[list["Project"]] = relationship("Project", back_populates="house")