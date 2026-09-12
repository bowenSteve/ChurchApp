import time

from fastapi import WebSocket

from .schemas import LiveStateOut, SettingsOut


class LiveState:
    def __init__(self) -> None:
        self.mass_plan_id: int | None = None
        self.item_id: int | None = None
        self.verse_index: int = 0
        self.is_blank: bool = False
        # Tracks when verse_index last changed (manually or via autoslide) so
        # the autoslide background loop knows when its interval has elapsed.
        self.last_advance: float = time.monotonic()

    def to_out(self, slide=None) -> LiveStateOut:
        return LiveStateOut(
            mass_plan_id=self.mass_plan_id,
            item_id=self.item_id,
            verse_index=self.verse_index,
            is_blank=self.is_blank,
            slide=slide,
        )


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        stale: list[WebSocket] = []
        for connection in self.active:
            try:
                await connection.send_json(message)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)

    async def broadcast_live_state(self, state: LiveState, slide=None) -> None:
        await self.broadcast(
            {"type": "live_state", "payload": state.to_out(slide=slide).model_dump(mode="json")}
        )

    async def broadcast_settings(self, settings: SettingsOut) -> None:
        await self.broadcast({"type": "settings", "payload": settings.model_dump(mode="json")})


live_state = LiveState()
connection_manager = ConnectionManager()
