from .models import MassPlanItem
from .schemas import SlideContent


def _clamp(value: int, low: int, high: int) -> int:
    return max(low, min(value, high))


def resolve_slide(item: MassPlanItem, verse_index: int) -> SlideContent:
    if item.content_type == "song" and item.song is not None:
        verses = sorted(item.song.verses, key=lambda v: v.order_index)
        if not verses:
            return SlideContent(label=item.song.title, text="", index=0, total=0)
        idx = _clamp(verse_index, 0, len(verses) - 1)
        verse = verses[idx]
        return SlideContent(
            label=verse.label,
            text=verse.content,
            index=idx,
            total=len(verses),
            font_family=verse.font_family,
        )

    if item.content_type == "text":
        if item.text_item is not None:
            raw_text = item.text_item.content
            font_family = item.text_item.font_family
        else:
            raw_text = item.text_content or ""
            font_family = item.font_family

        pages = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
        if not pages:
            return SlideContent(label=item.mass_part.name, text="", index=0, total=0)
        idx = _clamp(verse_index, 0, len(pages) - 1)
        return SlideContent(
            label=item.mass_part.name,
            text=pages[idx],
            index=idx,
            total=len(pages),
            font_family=font_family,
        )

    if item.content_type == "gallery" and item.gallery_item is not None:
        images = sorted(item.gallery_item.images, key=lambda im: im.order_index)
        if not images:
            return SlideContent(label=item.gallery_item.title, text="", index=0, total=0)
        idx = _clamp(verse_index, 0, len(images) - 1)
        return SlideContent(
            label=item.gallery_item.title,
            text="",
            index=idx,
            total=len(images),
            image_url=images[idx].url,
            autoslide_seconds=item.gallery_item.autoslide_seconds if len(images) > 1 else None,
        )

    return SlideContent(label=item.mass_part.name, text="", index=0, total=0)
