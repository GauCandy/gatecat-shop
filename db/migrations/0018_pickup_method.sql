CREATE TYPE delivery_method AS ENUM ('delivery', 'pickup');

ALTER TABLE orders ADD COLUMN delivery_method delivery_method NOT NULL DEFAULT 'delivery';

ALTER TABLE orders ALTER COLUMN recipient_name DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN province DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN district DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN ward DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN address_line DROP NOT NULL;
