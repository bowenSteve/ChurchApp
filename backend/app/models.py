from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    verses = relationship(
        "SongVerse",
        order_by="SongVerse.order_index",
        cascade="all, delete-orphan",
        back_populates="song",
    )


class SongVerse(Base):
    __tablename__ = "song_verses"

    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    label = Column(String, nullable=False)
    content = Column(Text, nullable=False, default="")
    font_family = Column(String, nullable=True)

    song = relationship("Song", back_populates="verses")


class TextItem(Base):
    __tablename__ = "text_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False, default="")
    font_family = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    autoslide_seconds = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    images = relationship(
        "GalleryImage",
        order_by="GalleryImage.order_index",
        cascade="all, delete-orphan",
        back_populates="gallery_item",
    )


class GalleryImage(Base):
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, index=True)
    gallery_item_id = Column(Integer, ForeignKey("gallery_items.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    url = Column(String, nullable=False)

    gallery_item = relationship("GalleryItem", back_populates="images")


class MassPart(Base):
    __tablename__ = "mass_parts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    default_order = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)


class MassPlan(Base):
    __tablename__ = "mass_plans"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    label = Column(String, nullable=True)
    theme_color = Column(String, nullable=True, default="#000000")
    theme_background_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship(
        "MassPlanItem",
        order_by="MassPlanItem.order_index",
        cascade="all, delete-orphan",
        back_populates="mass_plan",
    )


class MassPlanItem(Base):
    __tablename__ = "mass_plan_items"

    id = Column(Integer, primary_key=True, index=True)
    mass_plan_id = Column(Integer, ForeignKey("mass_plans.id"), nullable=False)
    mass_part_id = Column(Integer, ForeignKey("mass_parts.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    content_type = Column(String, nullable=False, default="blank")  # song | text | gallery | blank
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=True)
    text_item_id = Column(Integer, ForeignKey("text_items.id"), nullable=True)
    gallery_item_id = Column(Integer, ForeignKey("gallery_items.id"), nullable=True)
    text_content = Column(Text, nullable=True)
    font_family = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    mass_plan = relationship("MassPlan", back_populates="items")
    mass_part = relationship("MassPart")
    song = relationship("Song")
    text_item = relationship("TextItem")
    gallery_item = relationship("GalleryItem")


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, default=1)
    font_family = Column(String, nullable=False, default="Georgia, serif")
    font_size_px = Column(Integer, nullable=False, default=48)
    text_align = Column(String, nullable=False, default="center")
    text_color = Column(String, nullable=False, default="#FFFFFF")
    background_color = Column(String, nullable=False, default="#000000")
    background_image_url = Column(String, nullable=True)
    auto_fullscreen = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
