from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/songs", tags=["songs"])


@router.get("", response_model=list[schemas.SongOut])
def list_songs(db: Session = Depends(get_db)):
    return db.query(models.Song).order_by(models.Song.title).all()


@router.post("", response_model=schemas.SongOut)
def create_song(payload: schemas.SongCreate, db: Session = Depends(get_db)):
    song = models.Song(title=payload.title, category=payload.category)
    song.verses = [models.SongVerse(**v.model_dump()) for v in payload.verses]
    db.add(song)
    db.commit()
    db.refresh(song)
    return song


@router.get("/{song_id}", response_model=schemas.SongOut)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.get(models.Song, song_id)
    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.put("/{song_id}", response_model=schemas.SongOut)
def update_song(song_id: int, payload: schemas.SongUpdate, db: Session = Depends(get_db)):
    song = db.get(models.Song, song_id)
    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")
    song.title = payload.title
    song.category = payload.category
    song.verses = [models.SongVerse(**v.model_dump()) for v in payload.verses]
    db.commit()
    db.refresh(song)
    return song


@router.delete("/{song_id}", status_code=204)
def delete_song(song_id: int, db: Session = Depends(get_db)):
    song = db.get(models.Song, song_id)
    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")
    db.delete(song)
    db.commit()
