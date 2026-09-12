from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/texts", tags=["texts"])


@router.get("", response_model=list[schemas.TextItemOut])
def list_texts(db: Session = Depends(get_db)):
    return db.query(models.TextItem).order_by(models.TextItem.title).all()


@router.post("", response_model=schemas.TextItemOut)
def create_text(payload: schemas.TextItemCreate, db: Session = Depends(get_db)):
    text_item = models.TextItem(**payload.model_dump())
    db.add(text_item)
    db.commit()
    db.refresh(text_item)
    return text_item


@router.get("/{text_id}", response_model=schemas.TextItemOut)
def get_text(text_id: int, db: Session = Depends(get_db)):
    text_item = db.get(models.TextItem, text_id)
    if text_item is None:
        raise HTTPException(status_code=404, detail="Text not found")
    return text_item


@router.put("/{text_id}", response_model=schemas.TextItemOut)
def update_text(text_id: int, payload: schemas.TextItemUpdate, db: Session = Depends(get_db)):
    text_item = db.get(models.TextItem, text_id)
    if text_item is None:
        raise HTTPException(status_code=404, detail="Text not found")
    for field, value in payload.model_dump().items():
        setattr(text_item, field, value)
    db.commit()
    db.refresh(text_item)
    return text_item


@router.delete("/{text_id}", status_code=204)
def delete_text(text_id: int, db: Session = Depends(get_db)):
    text_item = db.get(models.TextItem, text_id)
    if text_item is None:
        raise HTTPException(status_code=404, detail="Text not found")
    db.delete(text_item)
    db.commit()
