CREATE TABLE product_categories (
  product_id   TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id  TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);

INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL;

DROP INDEX IF EXISTS idx_products_category_id;
ALTER TABLE products DROP COLUMN category_id;
