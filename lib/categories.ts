import crypto from "node:crypto";
import { pool } from "./db";
import type { Category } from "./categories-types";

export type { Category, CategoryNode } from "./categories-types";
export {
  buildTree,
  sortByTree,
  collectDescendantIds,
  depthOf,
  subtreeHeight,
  MAX_DEPTH,
} from "./category-tree";

const SELECT_COLS = `id, name, slug, image_url AS "imageUrl", sort_order AS "sortOrder", parent_id AS "parentId", is_featured AS "isFeatured"`;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function listCategories(): Promise<Category[]> {
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLS}
     FROM categories
     ORDER BY sort_order ASC, name ASC`
  );
  return rows;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  isFeatured: boolean;
}): Promise<Category> {
  const id = crypto.randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO categories (id, name, slug, image_url, parent_id, is_featured, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories))
     RETURNING ${SELECT_COLS}`,
    [id, data.name, data.slug, data.imageUrl, data.parentId, data.isFeatured]
  );
  return rows[0];
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    imageUrl: string | null;
    parentId: string | null;
    isFeatured: boolean;
  }
): Promise<Category | null> {
  const { rows } = await pool.query(
    `UPDATE categories
     SET name = $2, slug = $3, image_url = $4, parent_id = $5, is_featured = $6, updated_at = NOW()
     WHERE id = $1
     RETURNING ${SELECT_COLS}`,
    [id, data.name, data.slug, data.imageUrl, data.parentId, data.isFeatured]
  );
  return rows[0] ?? null;
}

export async function reorderCategories(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < ids.length; i++) {
      await client.query(
        "UPDATE categories SET sort_order = $1, updated_at = NOW() WHERE id = $2",
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

export async function deleteCategory(id: string): Promise<boolean> {
  const res = await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  const { rows } = await pool.query(
    exceptId
      ? "SELECT 1 FROM categories WHERE slug = $1 AND id <> $2 LIMIT 1"
      : "SELECT 1 FROM categories WHERE slug = $1 LIMIT 1",
    exceptId ? [slug, exceptId] : [slug]
  );
  return rows.length > 0;
}

