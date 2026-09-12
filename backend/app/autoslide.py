import asyncio
import time

from . import models
from .database import SessionLocal
from .live_state import connection_manager, live_state
from .slide_resolver import resolve_slide

TICK_SECONDS = 1


async def _tick() -> None:
    if live_state.is_blank or live_state.item_id is None:
        return
    db = SessionLocal()
    try:
        item = db.get(models.MassPlanItem, live_state.item_id)
        if item is None or item.content_type != "gallery" or item.gallery_item is None:
            return
        images = item.gallery_item.images
        interval = item.gallery_item.autoslide_seconds
        if not interval or len(images) <= 1:
            return
        if time.monotonic() - live_state.last_advance < interval:
            return
        live_state.verse_index = (live_state.verse_index + 1) % len(images)
        live_state.last_advance = time.monotonic()
        slide = resolve_slide(item, live_state.verse_index)
        await connection_manager.broadcast_live_state(live_state, slide=slide)
    finally:
        db.close()


async def autoslide_loop() -> None:
    """Advances a live gallery's image automatically on its configured
    interval and broadcasts the change, so every connected window (operator
    preview and the actual display) stays in sync without drifting apart."""
    while True:
        await asyncio.sleep(TICK_SECONDS)
        try:
            await _tick()
        except Exception:
            # Never let one bad tick kill the whole background loop.
            pass
