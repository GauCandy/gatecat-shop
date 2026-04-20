CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SHIPPER');

CREATE TABLE users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  role         user_role NOT NULL DEFAULT 'USER',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_methods (
  id                    TEXT PRIMARY KEY,
  provider              TEXT NOT NULL,
  provider_account_id   TEXT NOT NULL,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_account_id)
);

CREATE INDEX idx_auth_methods_user_id ON auth_methods(user_id);
