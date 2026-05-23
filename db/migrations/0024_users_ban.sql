ALTER TABLE users ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN ban_reason TEXT;
ALTER TABLE users ADD COLUMN banned_at TIMESTAMPTZ;

CREATE INDEX idx_users_is_banned ON users(is_banned) WHERE is_banned = TRUE;
