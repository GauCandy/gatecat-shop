ALTER TABLE categories
  ADD COLUMN parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE;

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
