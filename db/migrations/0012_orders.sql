CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled');

CREATE TABLE orders (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_name   TEXT NOT NULL,
  phone            TEXT NOT NULL,
  province         TEXT NOT NULL,
  district         TEXT NOT NULL,
  ward             TEXT NOT NULL,
  address_line     TEXT NOT NULL,
  note             TEXT,
  payment_method   TEXT NOT NULL DEFAULT 'cod',
  status           order_status NOT NULL DEFAULT 'pending',
  total_amount     BIGINT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id                TEXT PRIMARY KEY,
  order_id          TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id        TEXT NOT NULL REFERENCES product_variants(id),
  product_name      TEXT NOT NULL,
  variant_sku       TEXT NOT NULL,
  variant_image_url TEXT,
  unit_price        BIGINT NOT NULL,
  quantity          INT NOT NULL CHECK (quantity > 0),
  subtotal          BIGINT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
