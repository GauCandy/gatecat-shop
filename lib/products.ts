import crypto from "node:crypto";
import { pool } from "./db";
import { slugify } from "./categories";

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  imageUrl: string | null;
  listPrice: number;
  salePrice: number;
  sortOrder: number;
};

export type ProductCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  categories: ProductCategoryRef[];
  sortOrder: number;
  variants: ProductVariant[];
};

export { slugify };

async function fetchVariantsByProductIds(
  ids: string[]
): Promise<Map<string, ProductVariant[]>> {
  const map = new Map<string, ProductVariant[]>();
  if (ids.length === 0) return map;
  const { rows } = await pool.query<ProductVariant>(
    `SELECT id, product_id AS "productId", sku, image_url AS "imageUrl",
            list_price AS "listPrice", sale_price AS "salePrice",
            sort_order AS "sortOrder"
     FROM product_variants
     WHERE product_id = ANY($1::text[])
     ORDER BY sort_order ASC, created_at ASC`,
    [ids]
  );
  for (const v of rows) {
    const arr = map.get(v.productId) ?? [];
    arr.push(v);
    map.set(v.productId, arr);
  }
  return map;
}

async function fetchCategoriesByProductIds(
  ids: string[]
): Promise<Map<string, ProductCategoryRef[]>> {
  const map = new Map<string, ProductCategoryRef[]>();
  if (ids.length === 0) return map;
  const { rows } = await pool.query<{
    productId: string;
    id: string;
    name: string;
    slug: string;
  }>(
    `SELECT pc.product_id AS "productId", c.id, c.name, c.slug
     FROM product_categories pc
     JOIN categories c ON c.id = pc.category_id
     WHERE pc.product_id = ANY($1::text[])
     ORDER BY c.sort_order ASC, c.name ASC`,
    [ids]
  );
  for (const r of rows) {
    const arr = map.get(r.productId) ?? [];
    arr.push({ id: r.id, name: r.name, slug: r.slug });
    map.set(r.productId, arr);
  }
  return map;
}

export async function listProducts(): Promise<Product[]> {
  const { rows } = await pool.query(
    `SELECT id, name, slug, image_url AS "imageUrl", sort_order AS "sortOrder"
     FROM products
     ORDER BY sort_order ASC, name ASC`
  );
  const ids = rows.map((r) => r.id);
  const [variants, categories] = await Promise.all([
    fetchVariantsByProductIds(ids),
    fetchCategoriesByProductIds(ids),
  ]);
  return rows.map((r) => ({
    ...r,
    variants: variants.get(r.id) ?? [],
    categories: categories.get(r.id) ?? [],
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const { rows } = await pool.query(
    `SELECT id, name, slug, image_url AS "imageUrl", sort_order AS "sortOrder"
     FROM products WHERE id = $1 LIMIT 1`,
    [id]
  );
  const p = rows[0];
  if (!p) return null;
  const [variants, categories] = await Promise.all([
    fetchVariantsByProductIds([p.id]),
    fetchCategoriesByProductIds([p.id]),
  ]);
  return {
    ...p,
    variants: variants.get(p.id) ?? [],
    categories: categories.get(p.id) ?? [],
  };
}

export async function productSlugExists(
  slug: string,
  exceptId?: string
): Promise<boolean> {
  const { rows } = await pool.query(
    exceptId
      ? "SELECT 1 FROM products WHERE slug = $1 AND id <> $2 LIMIT 1"
      : "SELECT 1 FROM products WHERE slug = $1 LIMIT 1",
    exceptId ? [slug, exceptId] : [slug]
  );
  return rows.length > 0;
}

export async function generateUniqueProductSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name);
  if (!base) throw new Error("Tên sản phẩm không hợp lệ để tạo slug");
  if (!(await productSlugExists(base, excludeId))) return base;
  for (let i = 0; i < 5; i++) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const candidate = `${base}-${suffix}`;
    if (!(await productSlugExists(candidate, excludeId))) return candidate;
  }
  throw new Error("Không thể tạo slug duy nhất cho sản phẩm");
}

export async function skuExists(
  sku: string,
  exceptId?: string
): Promise<boolean> {
  const { rows } = await pool.query(
    exceptId
      ? "SELECT 1 FROM product_variants WHERE sku = $1 AND id <> $2 LIMIT 1"
      : "SELECT 1 FROM product_variants WHERE sku = $1 LIMIT 1",
    exceptId ? [sku, exceptId] : [sku]
  );
  return rows.length > 0;
}

export type VariantInput = {
  id?: string | null;
  sku: string;
  imageUrl: string | null;
  listPrice: number;
  salePrice: number;
};

export type ProductInput = {
  name: string;
  slug: string;
  imageUrl: string | null;
  categoryIds: string[];
};

async function syncCategories(
  client: import("pg").PoolClient,
  productId: string,
  categoryIds: string[]
): Promise<void> {
  const unique = Array.from(new Set(categoryIds));
  await client.query(
    "DELETE FROM product_categories WHERE product_id = $1",
    [productId]
  );
  for (const cid of unique) {
    await client.query(
      `INSERT INTO product_categories (product_id, category_id)
       VALUES ($1, $2)`,
      [productId, cid]
    );
  }
}

export async function createProduct(
  data: ProductInput,
  variants: VariantInput[]
): Promise<Product> {
  const id = crypto.randomUUID();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO products (id, name, slug, image_url, sort_order)
       VALUES ($1, $2, $3, $4,
               (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM products))`,
      [id, data.name, data.slug, data.imageUrl]
    );
    await syncCategories(client, id, data.categoryIds);
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      await client.query(
        `INSERT INTO product_variants
           (id, product_id, sku, image_url, list_price, sale_price, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          crypto.randomUUID(),
          id,
          v.sku,
          v.imageUrl,
          v.listPrice,
          v.salePrice,
          i + 1,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  const product = await getProductById(id);
  if (!product) throw new Error("Không tạo được sản phẩm");
  return product;
}

export async function updateProduct(
  id: string,
  data: ProductInput,
  variants: VariantInput[]
): Promise<Product | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rowCount } = await client.query(
      `UPDATE products
       SET name = $2, slug = $3, image_url = $4, updated_at = NOW()
       WHERE id = $1`,
      [id, data.name, data.slug, data.imageUrl]
    );
    if (!rowCount) {
      await client.query("ROLLBACK");
      return null;
    }

    await syncCategories(client, id, data.categoryIds);

    const keepIds = variants.map((v) => v.id).filter((x): x is string => !!x);
    if (keepIds.length === 0) {
      await client.query("DELETE FROM product_variants WHERE product_id = $1", [id]);
    } else {
      await client.query(
        `DELETE FROM product_variants
         WHERE product_id = $1 AND id <> ALL($2::text[])`,
        [id, keepIds]
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (v.id) {
        await client.query(
          `UPDATE product_variants
           SET sku = $2, image_url = $3, list_price = $4, sale_price = $5,
               sort_order = $6, updated_at = NOW()
           WHERE id = $1 AND product_id = $7`,
          [v.id, v.sku, v.imageUrl, v.listPrice, v.salePrice, i + 1, id]
        );
      } else {
        await client.query(
          `INSERT INTO product_variants
             (id, product_id, sku, image_url, list_price, sale_price, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            crypto.randomUUID(),
            id,
            v.sku,
            v.imageUrl,
            v.listPrice,
            v.salePrice,
            i + 1,
          ]
        );
      }
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function reorderProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < ids.length; i++) {
      await client.query(
        "UPDATE products SET sort_order = $1, updated_at = NOW() WHERE id = $2",
        [i + 1, ids[i]]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export function normalizeSku(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "-");
}
