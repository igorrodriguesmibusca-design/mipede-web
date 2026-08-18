-- Identidade visual (capas desktop/mobile + foco) e banners do cardápio.

ALTER TABLE store_settings ADD COLUMN logo_media_id TEXT;
ALTER TABLE store_settings ADD COLUMN cover_desktop_media_id TEXT;
ALTER TABLE store_settings ADD COLUMN cover_mobile_media_id TEXT;
ALTER TABLE store_settings ADD COLUMN cover_desktop_focus_x REAL NOT NULL DEFAULT 0.5;
ALTER TABLE store_settings ADD COLUMN cover_desktop_focus_y REAL NOT NULL DEFAULT 0.5;
ALTER TABLE store_settings ADD COLUMN cover_mobile_focus_x REAL NOT NULL DEFAULT 0.5;
ALTER TABLE store_settings ADD COLUMN cover_mobile_focus_y REAL NOT NULL DEFAULT 0.5;

CREATE TABLE IF NOT EXISTS storefront_banners (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  internal_name TEXT NOT NULL,
  desktop_media_id TEXT,
  mobile_media_id TEXT,
  alt_text TEXT,
  placement TEXT NOT NULL,
  after_category_id TEXT,
  target_type TEXT NOT NULL DEFAULT 'none',
  target_id TEXT,
  external_url TEXT,
  cta_label TEXT,
  device_scope TEXT NOT NULL DEFAULT 'both',
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  starts_at INTEGER,
  ends_at INTEGER,
  archived_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_banners_store ON storefront_banners(store_id, archived_at, status, placement, sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_period ON storefront_banners(store_id, starts_at, ends_at);
