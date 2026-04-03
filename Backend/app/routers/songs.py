from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.song import SongCreate, SongResponse, SongSingerCreate, SongSingerResponse

router = APIRouter(prefix="/songs", tags=["Songs"])


@router.get("/project/{project_id}", response_model=list[SongResponse])
async def get_songs_for_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT s.*,
               md.full_name AS music_director_name,
               l.full_name  AS lyricist_name
        FROM cinecore.song s
        JOIN cinecore.person md ON md.person_id = s.music_director_id
        LEFT JOIN cinecore.person l ON l.person_id = s.lyricist_id
        WHERE s.project_id = :pid
        ORDER BY s.song_id
    """), {"pid": project_id})
    return [dict(r) for r in result.mappings().all()]


@router.get("/{song_id}", response_model=SongResponse)
async def get_song(song_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM cinecore.song WHERE song_id = :id"),
        {"id": song_id}
    )
    row = result.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Song not found")
    return dict(row)


@router.post("/", response_model=SongResponse, status_code=201)
async def create_song(payload: SongCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.song
                (project_id, title, duration_seconds, music_director_id,
                 lyricist_id, recording_studio, recording_date, isrc_code)
            VALUES
                (:project_id, :title, :duration_seconds, :music_director_id,
                 :lyricist_id, :recording_studio, :recording_date, :isrc_code)
            RETURNING *
        """), payload.model_dump())
        row = result.mappings().first()
        await db.commit()
        return dict(row)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ------------------------------------------------------------------
# Song Singers — the junction table
# ------------------------------------------------------------------
@router.get("/{song_id}/singers", response_model=list[SongSingerResponse])
async def get_singers_for_song(song_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT ss.song_id, ss.singer_id, ss.voice_type,
               per.full_name AS singer_name
        FROM cinecore.song_singer ss
        JOIN cinecore.person per ON per.person_id = ss.singer_id
        WHERE ss.song_id = :sid
        ORDER BY ss.voice_type
    """), {"sid": song_id})
    return [dict(r) for r in result.mappings().all()]


@router.post("/{song_id}/singers", response_model=SongSingerResponse, status_code=201)
async def add_singer_to_song(song_id: int, payload: SongSingerCreate, db: AsyncSession = Depends(get_db)):
    if payload.song_id != song_id:
        raise HTTPException(status_code=400, detail="song_id in body must match URL")
    try:
        result = await db.execute(text("""
            INSERT INTO cinecore.song_singer (song_id, singer_id, voice_type)
            VALUES (:song_id, :singer_id, :voice_type)
            RETURNING *
        """), payload.model_dump())
        row = dict(result.mappings().first())
        await db.commit()

        # Fetch singer name to include in response
        person = await db.execute(
            text("SELECT full_name FROM cinecore.person WHERE person_id = :id"),
            {"id": row["singer_id"]}
        )
        person_row = person.mappings().first()
        row["singer_name"] = person_row["full_name"] if person_row else None
        return row
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{song_id}/singers/{singer_id}", status_code=204)
async def remove_singer_from_song(song_id: int, singer_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            DELETE FROM cinecore.song_singer
            WHERE song_id = :song_id AND singer_id = :singer_id
            RETURNING song_id
        """), {"song_id": song_id, "singer_id": singer_id})
        if not result.mappings().first():
            raise HTTPException(status_code=404, detail="Singer not found on this song")
        await db.commit()
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))