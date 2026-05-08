ALTER TABLE categories
  ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_categories_is_featured ON categories(is_featured) WHERE is_featured = true;
