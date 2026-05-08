CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');

ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN date_of_birth DATE;
ALTER TABLE users ADD COLUMN gender user_gender;

CREATE TABLE addresses (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_name  TEXT NOT NULL,
  phone           TEXT NOT NULL,
  province        TEXT NOT NULL,
  district        TEXT NOT NULL,
  ward            TEXT NOT NULL,
  address_line    TEXT NOT NULL,
  note            TEXT,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE UNIQUE INDEX idx_addresses_one_default_per_user
  ON addresses(user_id)
  WHERE is_default = TRUE;
