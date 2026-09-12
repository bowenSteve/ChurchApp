import asyncio

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .autoslide import autoslide_loop
from .database import APP_DIR, RESOURCES_DIR, Base, SessionLocal, engine, sync_missing_columns
from .routers import gallery, library, live, mass_parts, mass_plans, settings, songs, texts, uploads
from .seed import run_seed

app = FastAPI(title="Church Mass Display API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = APP_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(songs.router)
app.include_router(texts.router)
app.include_router(gallery.router)
app.include_router(uploads.router)
app.include_router(library.router)
app.include_router(mass_parts.router)
app.include_router(mass_plans.router)
app.include_router(settings.router)
app.include_router(live.router)

_autoslide_task: asyncio.Task | None = None


@app.on_event("startup")
async def on_startup() -> None:
    global _autoslide_task
    Base.metadata.create_all(bind=engine)
    sync_missing_columns()
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
    _autoslide_task = asyncio.create_task(autoslide_loop())


@app.on_event("shutdown")
async def on_shutdown() -> None:
    if _autoslide_task is not None:
        _autoslide_task.cancel()


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Packaged desktop build only: electron-builder copies the built frontend to
# resources/frontend-dist alongside the backend exe. Serving it from this same
# process means the Electron windows load http://localhost:<port>/... in both
# dev and packaged builds — client-side routing (BrowserRouter) needs a real
# server behind it, which a bare file:// load can't provide. Registered last
# so it can never shadow an API route; absent entirely in normal dev, since
# there's no frontend-dist next to a plain `uvicorn` run.
FRONTEND_DIST = RESOURCES_DIR / "frontend-dist"
if FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="frontend-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # An unmatched /api/* or /uploads/* means a real 404, not the SPA —
        # otherwise a typo'd or removed endpoint would silently return HTML.
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404, detail="Not Found")
        candidate = FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
