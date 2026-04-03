from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Script(Base):
    __tablename__ = "script"
    __table_args__ = (
        UniqueConstraint("project_id", "version_no", name="uq_script_project_version"),
        {"schema": "cinecore"},
    )

    script_id:      Mapped[int]      = mapped_column(Integer, primary_key=True)
    project_id:     Mapped[int]      = mapped_column(ForeignKey("cinecore.project.project_id"), nullable=False)
    version_no:     Mapped[int]      = mapped_column(Integer, nullable=False)
    written_by:     Mapped[int]      = mapped_column(ForeignKey("cinecore.person.person_id"), nullable=False)
    submitted_date: Mapped[date]     = mapped_column(Date, nullable=False)
    status:         Mapped[str]      = mapped_column(String(20), nullable=False)
    # DRAFT | UNDER_REVIEW | APPROVED | REJECTED
    notes:          Mapped[str|None] = mapped_column(Text)
    word_count:     Mapped[int|None] = mapped_column(Integer)

    project: Mapped["Project"] = relationship("Project", back_populates="scripts")
    writer:  Mapped["Person"]  = relationship("Person",  foreign_keys=[written_by])