from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/mass-parts", tags=["mass-parts"])


@router.get("", response_model=list[schemas.MassPartOut])
def list_mass_parts(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.MassPart)
    if active_only:
        query = query.filter(models.MassPart.is_active.is_(True))
    return query.order_by(models.MassPart.default_order).all()


@router.post("", response_model=schemas.MassPartOut)
def create_mass_part(payload: schemas.MassPartCreate, db: Session = Depends(get_db)):
    existing = db.query(models.MassPart).filter(models.MassPart.name == payload.name).first()
    if existing is not None:
        raise HTTPException(status_code=400, detail="A mass part with this name already exists")
    part = models.MassPart(name=payload.name, default_order=payload.default_order)
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


@router.put("/{part_id}", response_model=schemas.MassPartOut)
def update_mass_part(part_id: int, payload: schemas.MassPartUpdate, db: Session = Depends(get_db)):
    part = db.get(models.MassPart, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Mass part not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(part, field, value)
    db.commit()
    db.refresh(part)
    return part


@router.delete("/{part_id}", response_model=schemas.MassPartOut)
def delete_mass_part(part_id: int, db: Session = Depends(get_db)):
    part = db.get(models.MassPart, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Mass part not found")
    part.is_active = False
    db.commit()
    db.refresh(part)
    return part
