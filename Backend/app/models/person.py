from datetime import date

from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Person(Base):
    __tablename__ = "person"
    __table_args__ = {"schema": "cinecore"}

    person_id:          Mapped[int]       = mapped_column(Integer, primary_key=True)
    full_name:          Mapped[str]       = mapped_column(String(150), nullable=False)
    screen_name:        Mapped[str|None]  = mapped_column(String(150))
    nationality:        Mapped[str]       = mapped_column(String(100), nullable=False)
    dob:                Mapped[date]      = mapped_column(Date, nullable=False)
    gender:             Mapped[str|None]  = mapped_column(String(20))
    primary_profession: Mapped[str]       = mapped_column(String(100), nullable=False)
    pan_no:             Mapped[str]       = mapped_column(String(15), nullable=False, unique=True)
    contact_email:      Mapped[str]       = mapped_column(String(150), nullable=False)
    contact_phone:      Mapped[str|None]  = mapped_column(String(20))
    agent_name:         Mapped[str|None]  = mapped_column(String(150))
    agent_contact:      Mapped[str|None]  = mapped_column(String(150))

    contracts: Mapped[list["Contract"]] = relationship("Contract", back_populates="person")