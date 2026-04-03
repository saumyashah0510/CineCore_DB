from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Song(Base):
    __tablename__ = "song"
    __table_args__ = {"schema": "cinecore"}

    song_id:           Mapped[int]       = mapped_column(Integer, primary_key=True)
    project_id:        Mapped[int]       = mapped_column(ForeignKey("cinecore.project.project_id"), nullable=False)
    title:             Mapped[str]       = mapped_column(String(200), nullable=False)
    duration_seconds:  Mapped[int|None]  = mapped_column(Integer)
    music_director_id: Mapped[int]       = mapped_column(ForeignKey("cinecore.person.person_id"), nullable=False)
    lyricist_id:       Mapped[int|None]  = mapped_column(ForeignKey("cinecore.person.person_id"))
    recording_studio:  Mapped[str|None]  = mapped_column(String(150))
    recording_date:    Mapped[date|None] = mapped_column(Date)
    isrc_code:         Mapped[str|None]  = mapped_column(String(20), unique=True)

    project:        Mapped["Project"]          = relationship("Project", back_populates="songs")
    music_director: Mapped["Person"]           = relationship("Person", foreign_keys=[music_director_id])
    lyricist:       Mapped["Person | None"]    = relationship("Person", foreign_keys=[lyricist_id])
    singers:        Mapped[list["SongSinger"]] = relationship("SongSinger", back_populates="song")


class SongSinger(Base):
    """
    Junction table: Song ↔ Person (singer).
    Composite PK: (song_id, singer_id)
    voice_type: LEAD_MALE | LEAD_FEMALE | CHORUS
    """
    __tablename__ = "song_singer"
    __table_args__ = {"schema": "cinecore"}

    song_id:    Mapped[int] = mapped_column(ForeignKey("cinecore.song.song_id"),     primary_key=True)
    singer_id:  Mapped[int] = mapped_column(ForeignKey("cinecore.person.person_id"), primary_key=True)
    voice_type: Mapped[str] = mapped_column(String(30), nullable=False)

    song:   Mapped["Song"]   = relationship("Song",   back_populates="singers")
    singer: Mapped["Person"] = relationship("Person", foreign_keys=[singer_id])