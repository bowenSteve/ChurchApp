export interface SongVerse {
  id: number
  order_index: number
  label: string
  content: string
  font_family: string | null
}

export interface Song {
  id: number
  title: string
  category: string
  created_at: string
  updated_at: string
  verses: SongVerse[]
}

export type SongInput = {
  title: string
  category: string
  verses: { order_index: number; label: string; content: string; font_family: string | null }[]
}

export interface TextItem {
  id: number
  title: string
  category: string
  content: string
  font_family: string | null
  created_at: string
  updated_at: string
}

export type TextItemInput = {
  title: string
  category: string
  content: string
  font_family: string | null
}

export interface GalleryImage {
  id: number
  order_index: number
  url: string
}

export interface GalleryItem {
  id: number
  title: string
  category: string
  autoslide_seconds: number | null
  created_at: string
  updated_at: string
  images: GalleryImage[]
}

export type GalleryItemInput = {
  title: string
  category: string
  autoslide_seconds: number | null
  images: { order_index: number; url: string }[]
}

export interface MassPart {
  id: number
  name: string
  default_order: number | null
  is_active: boolean
}

export type ContentType = 'song' | 'text' | 'gallery' | 'blank'

export interface MassPlanItem {
  id: number
  mass_plan_id: number
  mass_part_id: number
  order_index: number
  content_type: ContentType
  song_id: number | null
  text_item_id: number | null
  gallery_item_id: number | null
  text_content: string | null
  font_family: string | null
  notes: string | null
  mass_part: MassPart
  song: Song | null
  text_item: TextItem | null
  gallery_item: GalleryItem | null
}

export interface MassPlan {
  id: number
  date: string
  label: string | null
  theme_color: string | null
  theme_background_url: string | null
  created_at: string
  updated_at: string
  items: MassPlanItem[]
}

export interface Settings {
  id: number
  font_family: string
  font_size_px: number
  text_align: 'left' | 'center' | 'right'
  text_color: string
  background_color: string
  background_image_url: string | null
  auto_fullscreen: boolean
  updated_at: string
}

export interface SlideContent {
  label: string
  text: string
  index: number
  total: number
  font_family: string | null
  image_url: string | null
  autoslide_seconds: number | null
}

export interface LiveState {
  mass_plan_id: number | null
  item_id: number | null
  verse_index: number
  is_blank: boolean
  slide: SlideContent | null
}
