from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/mass-plans", tags=["mass-plans"])


@router.get("", response_model=list[schemas.MassPlanOut])
def list_mass_plans(date: date_type | None = None, db: Session = Depends(get_db)):
    query = db.query(models.MassPlan)
    if date is not None:
        query = query.filter(models.MassPlan.date == date)
    return query.order_by(models.MassPlan.date.desc()).all()


@router.post("", response_model=schemas.MassPlanOut)
def create_mass_plan(payload: schemas.MassPlanCreate, db: Session = Depends(get_db)):
    plan = models.MassPlan(**payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def _get_plan_or_404(plan_id: int, db: Session) -> models.MassPlan:
    plan = db.get(models.MassPlan, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Mass plan not found")
    return plan


@router.get("/{plan_id}", response_model=schemas.MassPlanOut)
def get_mass_plan(plan_id: int, db: Session = Depends(get_db)):
    return _get_plan_or_404(plan_id, db)


@router.post("/{plan_id}/duplicate", response_model=schemas.MassPlanOut)
def duplicate_mass_plan(
    plan_id: int, payload: schemas.MassPlanDuplicateRequest, db: Session = Depends(get_db)
):
    source = _get_plan_or_404(plan_id, db)
    new_plan = models.MassPlan(
        date=payload.date,
        label=payload.label,
        theme_color=source.theme_color,
        theme_background_url=source.theme_background_url,
    )
    db.add(new_plan)
    db.flush()

    for item in sorted(source.items, key=lambda i: i.order_index):
        db.add(
            models.MassPlanItem(
                mass_plan_id=new_plan.id,
                mass_part_id=item.mass_part_id,
                order_index=item.order_index,
                content_type=item.content_type,
                song_id=item.song_id,
                text_item_id=item.text_item_id,
                text_content=item.text_content,
                font_family=item.font_family,
            )
        )

    db.commit()
    db.refresh(new_plan)
    return new_plan


@router.put("/{plan_id}", response_model=schemas.MassPlanOut)
def update_mass_plan(plan_id: int, payload: schemas.MassPlanUpdate, db: Session = Depends(get_db)):
    plan = _get_plan_or_404(plan_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=204)
def delete_mass_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = _get_plan_or_404(plan_id, db)
    db.delete(plan)
    db.commit()


@router.post("/{plan_id}/items", response_model=schemas.MassPlanItemOut)
def create_mass_plan_item(plan_id: int, payload: schemas.MassPlanItemCreate, db: Session = Depends(get_db)):
    _get_plan_or_404(plan_id, db)
    item = models.MassPlanItem(mass_plan_id=plan_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _get_item_or_404(plan_id: int, item_id: int, db: Session) -> models.MassPlanItem:
    item = (
        db.query(models.MassPlanItem)
        .filter(models.MassPlanItem.id == item_id, models.MassPlanItem.mass_plan_id == plan_id)
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Mass plan item not found")
    return item


@router.put("/{plan_id}/items/reorder", response_model=list[schemas.MassPlanItemOut])
def reorder_mass_plan_items(plan_id: int, payload: list[schemas.ReorderItem], db: Session = Depends(get_db)):
    _get_plan_or_404(plan_id, db)
    for entry in payload:
        item = _get_item_or_404(plan_id, entry.id, db)
        item.order_index = entry.order_index
    db.commit()
    plan = _get_plan_or_404(plan_id, db)
    return plan.items


@router.put("/{plan_id}/items/{item_id}", response_model=schemas.MassPlanItemOut)
def update_mass_plan_item(
    plan_id: int, item_id: int, payload: schemas.MassPlanItemUpdate, db: Session = Depends(get_db)
):
    item = _get_item_or_404(plan_id, item_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{plan_id}/items/{item_id}", status_code=204)
def delete_mass_plan_item(plan_id: int, item_id: int, db: Session = Depends(get_db)):
    item = _get_item_or_404(plan_id, item_id, db)
    db.delete(item)
    db.commit()
