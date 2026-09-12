import time

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..live_state import connection_manager, live_state
from ..slide_resolver import resolve_slide

router = APIRouter(tags=["live"])


def _current_item(db: Session) -> models.MassPlanItem | None:
    if live_state.item_id is None:
        return None
    return db.get(models.MassPlanItem, live_state.item_id)


def _current_slide(db: Session) -> schemas.SlideContent | None:
    if live_state.is_blank:
        return None
    item = _current_item(db)
    if item is None:
        return None
    return resolve_slide(item, live_state.verse_index)


@router.get("/api/live/state", response_model=schemas.LiveStateOut)
def get_live_state(db: Session = Depends(get_db)):
    return live_state.to_out(slide=_current_slide(db))


@router.post("/api/live/go-live", response_model=schemas.LiveStateOut)
async def go_live(payload: schemas.GoLiveRequest, db: Session = Depends(get_db)):
    item = db.get(models.MassPlanItem, payload.item_id)
    if item is None or item.mass_plan_id != payload.mass_plan_id:
        raise HTTPException(status_code=404, detail="Mass plan item not found")
    live_state.mass_plan_id = payload.mass_plan_id
    live_state.item_id = payload.item_id
    live_state.verse_index = payload.verse_index
    live_state.is_blank = False
    live_state.last_advance = time.monotonic()
    slide = _current_slide(db)
    await connection_manager.broadcast_live_state(live_state, slide=slide)
    return live_state.to_out(slide=slide)


async def _step_verse(db: Session, delta: int) -> schemas.LiveStateOut:
    item = _current_item(db)
    if item is None:
        raise HTTPException(status_code=400, detail="Nothing is live")
    slide = resolve_slide(item, live_state.verse_index)
    max_index = max(slide.total - 1, 0)
    live_state.verse_index = max(0, min(live_state.verse_index + delta, max_index))
    live_state.is_blank = False
    live_state.last_advance = time.monotonic()
    slide = _current_slide(db)
    await connection_manager.broadcast_live_state(live_state, slide=slide)
    return live_state.to_out(slide=slide)


@router.post("/api/live/next-verse", response_model=schemas.LiveStateOut)
async def next_verse(db: Session = Depends(get_db)):
    return await _step_verse(db, 1)


@router.post("/api/live/prev-verse", response_model=schemas.LiveStateOut)
async def prev_verse(db: Session = Depends(get_db)):
    return await _step_verse(db, -1)


async def _step_item(db: Session, delta: int) -> schemas.LiveStateOut:
    if live_state.mass_plan_id is None:
        raise HTTPException(status_code=400, detail="No mass plan is live")
    plan = db.get(models.MassPlan, live_state.mass_plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Mass plan not found")
    items = sorted(plan.items, key=lambda i: i.order_index)
    ids = [i.id for i in items]
    try:
        current_index = ids.index(live_state.item_id)
    except ValueError:
        current_index = 0
    new_index = max(0, min(current_index + delta, len(ids) - 1))
    live_state.item_id = ids[new_index]
    live_state.verse_index = 0
    live_state.is_blank = False
    live_state.last_advance = time.monotonic()
    slide = _current_slide(db)
    await connection_manager.broadcast_live_state(live_state, slide=slide)
    return live_state.to_out(slide=slide)


@router.post("/api/live/next-item", response_model=schemas.LiveStateOut)
async def next_item(db: Session = Depends(get_db)):
    return await _step_item(db, 1)


@router.post("/api/live/prev-item", response_model=schemas.LiveStateOut)
async def prev_item(db: Session = Depends(get_db)):
    return await _step_item(db, -1)


@router.post("/api/live/blank", response_model=schemas.LiveStateOut)
async def set_blank(payload: schemas.BlankRequest, db: Session = Depends(get_db)):
    live_state.is_blank = payload.blank
    live_state.last_advance = time.monotonic()
    slide = _current_slide(db)
    await connection_manager.broadcast_live_state(live_state, slide=slide)
    return live_state.to_out(slide=slide)


@router.websocket("/ws/display")
async def display_socket(websocket: WebSocket, db: Session = Depends(get_db)):
    await connection_manager.connect(websocket)
    try:
        slide = _current_slide(db)
        await websocket.send_json(
            {"type": "live_state", "payload": live_state.to_out(slide=slide).model_dump(mode="json")}
        )
        settings = db.get(models.Settings, 1)
        if settings is not None:
            await websocket.send_json(
                {
                    "type": "settings",
                    "payload": schemas.SettingsOut.model_validate(settings).model_dump(mode="json"),
                }
            )
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
