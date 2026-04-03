from datetime import date

from pydantic import BaseModel, ConfigDict


class SongCreate(BaseModel):
    project_id: int
    title: str
    duration_seconds: int | None = None
    music_director_id: int
    lyricist_id: int | None = None
    recording_studio: str | None = None
    recording_date: date | None = None
    isrc_code: str | None = None

class SongResponse(SongCreate):
    song_id: int
    model_config = ConfigDict(from_attributes=True)


class SongSingerCreate(BaseModel):
    song_id: int
    singer_id: int
    voice_type: str              # LEAD_MALE | LEAD_FEMALE | CHORUS

class SongSingerResponse(BaseModel):
    song_id: int
    singer_id: int
    voice_type: str
    singer_name: str | None = None   # joined from Person in router
    model_config = ConfigDict(from_attributes=True)