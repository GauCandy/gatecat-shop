CREATE TYPE voucher_visibility AS ENUM ('public', 'private');
CREATE TYPE voucher_discount_type AS ENUM ('percent', 'amount');

CREATE TABLE vouchers (
  id               TEXT PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  description      TEXT,
  visibility       voucher_visibility NOT NULL DEFAULT 'public',
  discount_type    voucher_discount_type NOT NULL,
  discount_value   BIGINT NOT NULL CHECK (discount_value > 0),
  max_discount     BIGINT,
  min_order_total  BIGINT,
  usage_limit      INT,
  used_count       INT NOT NULL DEFAULT 0,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE voucher_redemptions (
  id               TEXT PRIMARY KEY,
  voucher_id       TEXT NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id         TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount  BIGINT NOT NULL,
  redeemed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (voucher_id, user_id)
);

CREATE INDEX idx_voucher_redemptions_user ON voucher_redemptions(user_id);
CREATE INDEX idx_voucher_redemptions_voucher ON voucher_redemptions(voucher_id);

ALTER TABLE orders ADD COLUMN voucher_id TEXT REFERENCES vouchers(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN discount_amount BIGINT NOT NULL DEFAULT 0;
