import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile

from .. import schemas
from ..database import APP_DIR

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

UPLOAD_DIR = APP_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024


@router.post("", response_model=schemas.UploadOut)
async def upload_image(file: UploadFile):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image is too large (max 15MB)")

    filename = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / filename).write_bytes(contents)
    return schemas.UploadOut(url=f"/uploads/{filename}")
