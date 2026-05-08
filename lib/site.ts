import crypto from "node:crypto";
import { pool } from "./db";

export const DEFAULT_MARQUEE_ITEMS = [
  "Freeship toàn quốc",
  "Trả góp 0% lãi suất",
  "Bảo hành 24 tháng",
  "Chính hãng 100%",
  "Đổi trả miễn phí 7 ngày",
  "Giao hỏa tốc 2 giờ",
];

export type SiteSettings = {
  logoUrl: string | null;
  siteName: string;
  marqueeItems: string[];
  heroBgUrl: string | null;
  heroShowcaseLabel: string;
  heroShowcaseText: string;
  heroShowcaseImageUrl: string | null;
};

export type Banner = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Popup = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { rows } = await pool.query<{ key: string; value: string | null }>(
    `SELECT key, value FROM site_settings WHERE key IN (
      'logo_url', 'site_name', 'marquee_items', 'hero_bg_url',
      'hero_showcase_label', 'hero_showcase_text', 'hero_showcase_image_url'
    )`
  );
  const map = new Map(rows.map((r) => [r.key, r.value]));

  let marqueeItems = DEFAULT_MARQUEE_ITEMS;
  const raw = map.get("marquee_items");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) marqueeItems = parsed;
    } catch { /* use defaults */ }
  }

  return {
    logoUrl: map.get("logo_url") ?? null,
    siteName: map.get("site_name") ?? "Gatecat",
    marqueeItems,
    heroBgUrl: map.get("hero_bg_url") ?? null,
    heroShowcaseLabel: map.get("hero_showcase_label") ?? "NOW SHOWING",
    heroShowcaseText: map.get("hero_showcase_text") ?? "Bộ sưu tập đang được lắp ráp.",
    heroShowcaseImageUrl: map.get("hero_showcase_image_url") ?? null,
  };
}

export async function setSiteSetting(key: string, value: string | null): Promise<void> {
  await pool.query(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value]
  );
}

const BANNER_SELECT = `
  id, image_url AS "imageUrl", link_url AS "linkUrl", title,
  sort_order AS "sortOrder", is_active AS "isActive",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

export async function listBanners(activeOnly = false): Promise<Banner[]> {
  const sql = activeOnly
    ? `SELECT ${BANNER_SELECT} FROM banners WHERE is_active = TRUE ORDER BY sort_order, created_at`
    : `SELECT ${BANNER_SELECT} FROM banners ORDER BY sort_order, created_at`;
  const { rows } = await pool.query<Banner>(sql);
  return rows;
}

export async function createBanner(input: {
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
  isActive: boolean;
}): Promise<Banner> {
  const id = crypto.randomUUID();
  const sortRes = await pool.query<{ next: number }>(
    `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM banners`
  );
  const sortOrder = Number(sortRes.rows[0]?.next ?? 1);
  const { rows } = await pool.query<Banner>(
    `INSERT INTO banners (id, image_url, link_url, title, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${BANNER_SELECT}`,
    [id, input.imageUrl, input.linkUrl, input.title, sortOrder, input.isActive]
  );
  return rows[0];
}

export async function updateBanner(
  id: string,
  patch: { imageUrl?: string; linkUrl?: string | null; title?: string | null; isActive?: boolean }
): Promise<Banner | null> {
  const fields: string[] = [];
  const values: unknown[] = [id];
  let i = 2;
  if (patch.imageUrl !== undefined) {
    fields.push(`image_url = $${i++}`);
    values.push(patch.imageUrl);
  }
  if (patch.linkUrl !== undefined) {
    fields.push(`link_url = $${i++}`);
    values.push(patch.linkUrl);
  }
  if (patch.title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(patch.title);
  }
  if (patch.isActive !== undefined) {
    fields.push(`is_active = $${i++}`);
    values.push(patch.isActive);
  }
  if (!fields.length) return null;
  fields.push(`updated_at = NOW()`);
  const { rows } = await pool.query<Banner>(
    `UPDATE banners SET ${fields.join(", ")} WHERE id = $1 RETURNING ${BANNER_SELECT}`,
    values
  );
  return rows[0] ?? null;
}

export async function deleteBanner(id: string): Promise<void> {
  await pool.query(`DELETE FROM banners WHERE id = $1`, [id]);
}

const POPUP_SELECT = `
  id, image_url AS "imageUrl", link_url AS "linkUrl", title,
  is_active AS "isActive",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

export async function listPopups(activeOnly = false): Promise<Popup[]> {
  const sql = activeOnly
    ? `SELECT ${POPUP_SELECT} FROM popups WHERE is_active = TRUE ORDER BY updated_at DESC`
    : `SELECT ${POPUP_SELECT} FROM popups ORDER BY updated_at DESC`;
  const { rows } = await pool.query<Popup>(sql);
  return rows;
}

export async function getActivePopup(): Promise<Popup | null> {
  const { rows } = await pool.query<Popup>(
    `SELECT ${POPUP_SELECT} FROM popups WHERE is_active = TRUE
     ORDER BY updated_at DESC LIMIT 1`
  );
  return rows[0] ?? null;
}

export async function createPopup(input: {
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
  isActive: boolean;
}): Promise<Popup> {
  const id = crypto.randomUUID();
  const { rows } = await pool.query<Popup>(
    `INSERT INTO popups (id, image_url, link_url, title, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${POPUP_SELECT}`,
    [id, input.imageUrl, input.linkUrl, input.title, input.isActive]
  );
  return rows[0];
}

export async function updatePopup(
  id: string,
  patch: { imageUrl?: string; linkUrl?: string | null; title?: string | null; isActive?: boolean }
): Promise<Popup | null> {
  const fields: string[] = [];
  const values: unknown[] = [id];
  let i = 2;
  if (patch.imageUrl !== undefined) {
    fields.push(`image_url = $${i++}`);
    values.push(patch.imageUrl);
  }
  if (patch.linkUrl !== undefined) {
    fields.push(`link_url = $${i++}`);
    values.push(patch.linkUrl);
  }
  if (patch.title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(patch.title);
  }
  if (patch.isActive !== undefined) {
    fields.push(`is_active = $${i++}`);
    values.push(patch.isActive);
  }
  if (!fields.length) return null;
  fields.push(`updated_at = NOW()`);
  const { rows } = await pool.query<Popup>(
    `UPDATE popups SET ${fields.join(", ")} WHERE id = $1 RETURNING ${POPUP_SELECT}`,
    values
  );
  return rows[0] ?? null;
}

export async function deletePopup(id: string): Promise<void> {
  await pool.query(`DELETE FROM popups WHERE id = $1`, [id]);
}
