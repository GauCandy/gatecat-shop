UPDATE product_variants SET stock = 0 WHERE stock < 0;
ALTER TABLE product_variants ADD CONSTRAINT product_variants_stock_nonneg CHECK (stock >= 0);
