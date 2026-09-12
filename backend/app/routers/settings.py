from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..live_state import connection_manager

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create_settings(db: Session) -> models.Settings:
    settings = db.get(models.Settings, 1)
    if settings is None:
        settings = models.Settings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=schemas.SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create_settings(db)


@router.put("", response_model=schemas.SettingsOut)
async def update_settings(payload: schemas.SettingsUpdate, db: Session = Depends(get_db)):
    settings = _get_or_create_settings(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    out = schemas.SettingsOut.model_validate(settings)
    await connection_manager.broadcast_settings(out)
    return out
