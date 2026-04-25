ALTER TABLE reviews ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_reviews_hidden ON reviews(is_hidden) WHERE is_hidden = FALSE;
