import io
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import APP_DIR, get_db

router = APIRouter(prefix="/api/library", tags=["library"])

UPLOAD_DIR = APP_DIR / "uploads"

MANIFEST_VERSION = 1
SAFE_FILENAME_RE = re.compile(r"^[A-Za-z0-9_.-]+$")


def _image_filename(url: str) -> str:
    return Path(url).name


@router.get("/export")
def export_library(db: Session = Depends(get_db)) -> StreamingResponse:
    songs = db.query(models.Song).order_by(models.Song.title).all()
    texts = db.query(models.TextItem).order_by(models.TextItem.title).all()
    galleries = (
        db.query(models.GalleryItem)
        .options(joinedload(models.GalleryItem.images))
        .order_by(models.GalleryItem.title)
        .all()
    )

    referenced_categories = (
        {s.category for s in songs} | {t.category for t in texts} | {g.category for g in galleries}
    )
    mass_parts = (
        db.query(models.MassPart)
        .filter(models.MassPart.name.in_(referenced_categories))
        .order_by(models.MassPart.name)
        .all()
    )

    manifest = {
        "version": MANIFEST_VERSION,
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "mass_parts": [{"name": p.name, "default_order": p.default_order} for p in mass_parts],
        "songs": [
            {
                "title": s.title,
                "category": s.category,
                "verses": [
                    {
                        "order_index": v.order_index,
                        "label": v.label,
                        "content": v.content,
                        "font_family": v.font_family,
                    }
                    for v in s.verses
                ],
            }
            for s in songs
        ],
        "texts": [
            {
                "title": t.title,
                "category": t.category,
                "content": t.content,
                "font_family": t.font_family,
            }
            for t in texts
        ],
        "gallery_items": [
            {
                "title": g.title,
                "category": g.category,
                "autoslide_seconds": g.autoslide_seconds,
                "images": [
                    {"order_index": img.order_index, "filename": _image_filename(img.url)}
                    for img in g.images
                ],
            }
            for g in galleries
        ],
    }

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("library.json", json.dumps(manifest, indent=2))
        included_files = set()
        for gallery in galleries:
            for image in gallery.images:
                filename = _image_filename(image.url)
                if filename in included_files:
                    continue
                path = UPLOAD_DIR / filename
                if path.is_file():
                    zf.write(path, f"images/{filename}")
                    included_files.add(filename)
    buffer.seek(0)

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="mass-display-library-{stamp}.zip"'},
    )


@router.post("/import", response_model=schemas.LibraryImportResult)
async def import_library(file: UploadFile, db: Session = Depends(get_db)) -> schemas.LibraryImportResult:
    contents = await file.read()
    try:
        archive = zipfile.ZipFile(io.BytesIO(contents))
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="That file isn't a valid .zip archive.")

    try:
        manifest = json.loads(archive.read("library.json"))
    except KeyError:
        raise HTTPException(
            status_code=400, detail="This archive doesn't contain a library.json — is it a Mass Display export?"
        )
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="library.json inside the archive isn't valid JSON.")

    if manifest.get("version") != MANIFEST_VERSION:
        raise HTTPException(status_code=400, detail="This archive was made by an incompatible export version.")

    try:
        # Restore any referenced categories first, upserting by name so a
        # re-import of the same archive doesn't create duplicate mass parts.
        for part in manifest.get("mass_parts", []):
            name = (part.get("name") or "").strip()
            if not name:
                continue
            exists = db.query(models.MassPart).filter(models.MassPart.name == name).first()
            if exists is None:
                db.add(models.MassPart(name=name, default_order=part.get("default_order")))

        # Extract only images actually referenced by the manifest, and only
        # to plain filenames inside the upload dir — never a path from the zip.
        for gallery in manifest.get("gallery_items", []):
            for image in gallery.get("images", []):
                filename = Path(str(image.get("filename", ""))).name
                if not filename or not SAFE_FILENAME_RE.match(filename):
                    continue
                member = f"images/{filename}"
                dest = UPLOAD_DIR / filename
                if member in archive.namelist() and not dest.exists():
                    dest.write_bytes(archive.read(member))

        songs_imported = 0
        for song in manifest.get("songs", []):
            db.add(
                models.Song(
                    title=song["title"],
                    category=song["category"],
                    verses=[
                        models.SongVerse(
                            order_index=v["order_index"],
                            label=v["label"],
                            content=v.get("content", ""),
                            font_family=v.get("font_family"),
                        )
                        for v in song.get("verses", [])
                    ],
                )
            )
            songs_imported += 1

        texts_imported = 0
        for text_item in manifest.get("texts", []):
            db.add(
                models.TextItem(
                    title=text_item["title"],
                    category=text_item["category"],
                    content=text_item.get("content", ""),
                    font_family=text_item.get("font_family"),
                )
            )
            texts_imported += 1

        gallery_items_imported = 0
        for gallery in manifest.get("gallery_items", []):
            images = []
            for img in gallery.get("images", []):
                filename = Path(str(img.get("filename", ""))).name
                if not filename or not SAFE_FILENAME_RE.match(filename):
                    continue
                images.append(models.GalleryImage(order_index=img["order_index"], url=f"/uploads/{filename}"))
            db.add(
                models.GalleryItem(
                    title=gallery["title"],
                    category=gallery["category"],
                    autoslide_seconds=gallery.get("autoslide_seconds"),
                    images=images,
                )
            )
            gallery_items_imported += 1
    except (KeyError, TypeError):
        db.rollback()
        raise HTTPException(status_code=400, detail="The archive's library.json is missing expected fields.")

    db.commit()

    return schemas.LibraryImportResult(
        songs_imported=songs_imported,
        texts_imported=texts_imported,
        gallery_items_imported=gallery_items_imported,
    )
