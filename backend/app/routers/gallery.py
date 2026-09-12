from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/gallery", tags=["gallery"])


@router.get("", response_model=list[schemas.GalleryItemOut])
def list_gallery_items(db: Session = Depends(get_db)):
    return db.query(models.GalleryItem).order_by(models.GalleryItem.title).all()


@router.post("", response_model=schemas.GalleryItemOut)
def create_gallery_item(payload: schemas.GalleryItemCreate, db: Session = Depends(get_db)):
    item = models.GalleryItem(
        title=payload.title, category=payload.category, autoslide_seconds=payload.autoslide_seconds
    )
    item.images = [models.GalleryImage(**img.model_dump()) for img in payload.images]
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{gallery_id}", response_model=schemas.GalleryItemOut)
def get_gallery_item(gallery_id: int, db: Session = Depends(get_db)):
    item = db.get(models.GalleryItem, gallery_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return item


@router.put("/{gallery_id}", response_model=schemas.GalleryItemOut)
def update_gallery_item(
    gallery_id: int, payload: schemas.GalleryItemUpdate, db: Session = Depends(get_db)
):
    item = db.get(models.GalleryItem, gallery_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    item.title = payload.title
    item.category = payload.category
    item.autoslide_seconds = payload.autoslide_seconds
    item.images = [models.GalleryImage(**img.model_dump()) for img in payload.images]
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{gallery_id}", status_code=204)
def delete_gallery_item(gallery_id: int, db: Session = Depends(get_db)):
    item = db.get(models.GalleryItem, gallery_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    db.delete(item)
    db.commit()
