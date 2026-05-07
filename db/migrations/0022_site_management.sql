CREATE TABLE site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('logo_url', NULL),
  ('site_name', 'Gatecat');

CREATE TABLE banners (
  id         TEXT PRIMARY KEY,
  image_url  TEXT NOT NULL,
  link_url   TEXT,
  title      TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_active_sort ON banners(is_active, sort_order);

CREATE TABLE popups (
  id         TEXT PRIMARY KEY,
  image_url  TEXT NOT NULL,
  link_url   TEXT,
  title      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_popups_active ON popups(is_active);
