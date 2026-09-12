from datetime import date as date_type, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


# ---------- Song ----------


class SongVerseBase(BaseModel):
    order_index: int
    label: str
    content: str = ""
    font_family: Optional[str] = None


class SongVerseOut(SongVerseBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SongCreate(BaseModel):
    title: str
    category: str
    verses: list[SongVerseBase] = []


class SongUpdate(SongCreate):
    pass


class SongOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    category: str
    created_at: datetime
    updated_at: datetime
    verses: list[SongVerseOut] = []


# ---------- TextItem ----------


class TextItemCreate(BaseModel):
    title: str
    category: str
    content: str = ""
    font_family: Optional[str] = None


class TextItemUpdate(TextItemCreate):
    pass


class TextItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    category: str
    content: str
    font_family: Optional[str]
    created_at: datetime
    updated_at: datetime


# ---------- GalleryItem ----------


class GalleryImageBase(BaseModel):
    order_index: int
    url: str


class GalleryImageOut(GalleryImageBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class GalleryItemCreate(BaseModel):
    title: str
    category: str
    autoslide_seconds: Optional[int] = None
    images: list[GalleryImageBase] = []


class GalleryItemUpdate(GalleryItemCreate):
    pass


class GalleryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    category: str
    autoslide_seconds: Optional[int]
    created_at: datetime
    updated_at: datetime
    images: list[GalleryImageOut] = []


class UploadOut(BaseModel):
    url: str


# ---------- Library import/export ----------


class LibraryImportResult(BaseModel):
    songs_imported: int
    texts_imported: int
    gallery_items_imported: int


# ---------- MassPart ----------


class MassPartCreate(BaseModel):
    name: str
    default_order: Optional[int] = None


class MassPartUpdate(BaseModel):
    name: Optional[str] = None
    default_order: Optional[int] = None
    is_active: Optional[bool] = None


class MassPartOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    default_order: Optional[int]
    is_active: bool


# ---------- MassPlanItem ----------


class MassPlanItemCreate(BaseModel):
    mass_part_id: int
    order_index: int
    content_type: Literal["song", "text", "gallery", "blank"] = "blank"
    song_id: Optional[int] = None
    text_item_id: Optional[int] = None
    gallery_item_id: Optional[int] = None
    text_content: Optional[str] = None
    font_family: Optional[str] = None
    notes: Optional[str] = None


class MassPlanItemUpdate(BaseModel):
    mass_part_id: Optional[int] = None
    order_index: Optional[int] = None
    content_type: Optional[Literal["song", "text", "gallery", "blank"]] = None
    song_id: Optional[int] = None
    text_item_id: Optional[int] = None
    gallery_item_id: Optional[int] = None
    text_content: Optional[str] = None
    font_family: Optional[str] = None
    notes: Optional[str] = None


class MassPlanItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    mass_plan_id: int
    mass_part_id: int
    order_index: int
    content_type: str
    song_id: Optional[int]
    text_item_id: Optional[int]
    gallery_item_id: Optional[int]
    text_content: Optional[str]
    font_family: Optional[str]
    notes: Optional[str]
    mass_part: MassPartOut
    song: Optional[SongOut] = None
    text_item: Optional[TextItemOut] = None
    gallery_item: Optional[GalleryItemOut] = None


class ReorderItem(BaseModel):
    id: int
    order_index: int


# ---------- MassPlan ----------


class MassPlanCreate(BaseModel):
    date: date_type
    label: Optional[str] = None
    theme_color: Optional[str] = "#000000"
    theme_background_url: Optional[str] = None


class MassPlanUpdate(BaseModel):
    date: Optional[date_type] = None
    label: Optional[str] = None
    theme_color: Optional[str] = None
    theme_background_url: Optional[str] = None


class MassPlanDuplicateRequest(BaseModel):
    date: date_type
    label: Optional[str] = None


class MassPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    date: date_type
    label: Optional[str]
    theme_color: Optional[str]
    theme_background_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: list[MassPlanItemOut] = []


# ---------- Settings ----------


class SettingsUpdate(BaseModel):
    font_family: Optional[str] = None
    font_size_px: Optional[int] = None
    text_align: Optional[Literal["left", "center", "right"]] = None
    text_color: Optional[str] = None
    background_color: Optional[str] = None
    background_image_url: Optional[str] = None
    auto_fullscreen: Optional[bool] = None


class SettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    font_family: str
    font_size_px: int
    text_align: str
    text_color: str
    background_color: str
    background_image_url: Optional[str]
    auto_fullscreen: bool
    updated_at: datetime


# ---------- Live ----------


class GoLiveRequest(BaseModel):
    mass_plan_id: int
    item_id: int
    verse_index: int = 0


class BlankRequest(BaseModel):
    blank: bool


class SlideContent(BaseModel):
    label: str
    text: str
    index: int
    total: int
    font_family: Optional[str] = None
    image_url: Optional[str] = None
    autoslide_seconds: Optional[int] = None


class LiveStateOut(BaseModel):
    mass_plan_id: Optional[int] = None
    item_id: Optional[int] = None
    verse_index: int = 0
    is_blank: bool = False
    slide: Optional[SlideContent] = None
