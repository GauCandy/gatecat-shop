import crypto from "node:crypto";
import { pool } from "./db";

export type Review = {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReviewableProduct = {
  productId: string;
  productName: string;
  variantSku: string;
  variantImageUrl: string | null;
  existingReview: Review | null;
};

export type ProductRatingStats = {
  count: number;
  average: number;
};

const REVIEW_SELECT = `
  r.id,
  r.order_id AS "orderId",
  r.product_id AS "productId",
  r.user_id AS "userId",
  u.name AS "userName",
  u.avatar_url AS "userAvatarUrl",
  r.rating,
  r.comment,
  r.created_at AS "createdAt",
  r.updated_at AS "updatedAt"
`;

export async function listReviewsForProduct(productId: string): Promise<Review[]> {
  const { rows } = await pool.query<Review>(
    `SELECT ${REVIEW_SELECT}
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1 AND r.is_hidden = FALSE
     ORDER BY r.updated_at DESC`,
    [productId]
  );
  return rows;
}

export async function getProductRatingStats(
  productId: string
): Promise<ProductRatingStats> {
  const { rows } = await pool.query<{ count: string; avg: string | null }>(
    `SELECT COUNT(*)::text AS count, AVG(rating)::text AS avg
     FROM reviews WHERE product_id = $1 AND is_hidden = FALSE`,
    [productId]
  );
  const count = Number(rows[0]?.count ?? 0);
  const average = rows[0]?.avg ? Number(rows[0].avg) : 0;
  return { count, average };
}

export type AdminReviewRow = Review & {
  productName: string;
  productSlug: string;
  isHidden: boolean;
};

export async function listReviewsForAdmin(): Promise<AdminReviewRow[]> {
  const { rows } = await pool.query<AdminReviewRow>(
    `SELECT ${REVIEW_SELECT},
            p.name AS "productName",
            p.slug AS "productSlug",
            r.is_hidden AS "isHidden"
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN products p ON p.id = r.product_id
     ORDER BY r.updated_at DESC`
  );
  return rows;
}

export async function setReviewHidden(id: string, hidden: boolean): Promise<void> {
  await pool.query(
    `UPDATE reviews SET is_hidden = $2, updated_at = updated_at WHERE id = $1`,
    [id, hidden]
  );
}

export async function listReviewableProductsForOrder(
  userId: string,
  orderId: string
): Promise<ReviewableProduct[]> {
  const ownership = await pool.query(
    `SELECT status::text AS status FROM orders WHERE id = $1 AND user_id = $2`,
    [orderId, userId]
  );
  if (!ownership.rows.length) throw new Error("Đơn hàng không tồn tại");

  const { rows } = await pool.query<{
    productId: string;
    productName: string;
    variantSku: string;
    variantImageUrl: string | null;
  }>(
    `SELECT DISTINCT ON (pv.product_id)
        pv.product_id AS "productId",
        oi.product_name AS "productName",
        oi.variant_sku AS "variantSku",
        oi.variant_image_url AS "variantImageUrl"
     FROM order_items oi
     JOIN product_variants pv ON pv.id = oi.variant_id
     WHERE oi.order_id = $1
     ORDER BY pv.product_id, oi.created_at`,
    [orderId]
  );

  if (!rows.length) return [];

  const productIds = rows.map((r) => r.productId);
  const existing = await pool.query<Review>(
    `SELECT ${REVIEW_SELECT}
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.order_id = $1 AND r.product_id = ANY($2)`,
    [orderId, productIds]
  );
  const reviewMap = new Map<string, Review>();
  for (const r of existing.rows) reviewMap.set(r.productId, r);

  return rows.map((r) => ({
    ...r,
    existingReview: reviewMap.get(r.productId) ?? null,
  }));
}

export async function upsertReview(
  userId: string,
  input: { orderId: string; productId: string; rating: number; comment: string | null }
): Promise<Review> {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("Rating phải từ 1 đến 5");
  }

  const ownership = await pool.query<{ status: string }>(
    `SELECT status::text AS status FROM orders WHERE id = $1 AND user_id = $2`,
    [input.orderId, userId]
  );
  if (!ownership.rows.length) throw new Error("Đơn hàng không tồn tại");
  if (ownership.rows[0].status !== "delivered") {
    throw new Error("Chỉ có thể đánh giá sau khi đơn đã giao");
  }

  const inOrder = await pool.query(
    `SELECT 1 FROM order_items oi
     JOIN product_variants pv ON pv.id = oi.variant_id
     WHERE oi.order_id = $1 AND pv.product_id = $2 LIMIT 1`,
    [input.orderId, input.productId]
  );
  if (!inOrder.rows.length) {
    throw new Error("Sản phẩm không có trong đơn hàng này");
  }

  const comment = input.comment?.trim() || null;
  const id = crypto.randomUUID();

  const { rows } = await pool.query<Review>(
    `INSERT INTO reviews (id, order_id, product_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (order_id, product_id) DO UPDATE SET
       rating = EXCLUDED.rating,
       comment = EXCLUDED.comment,
       updated_at = NOW()
     RETURNING id, order_id AS "orderId", product_id AS "productId",
               user_id AS "userId", rating, comment,
               created_at AS "createdAt", updated_at AS "updatedAt"`,
    [id, input.orderId, input.productId, userId, input.rating, comment]
  );

  const user = await pool.query<{ name: string; avatar_url: string | null }>(
    `SELECT name, avatar_url FROM users WHERE id = $1`,
    [userId]
  );

  return {
    ...rows[0],
    userName: user.rows[0]?.name ?? "",
    userAvatarUrl: user.rows[0]?.avatar_url ?? null,
  };
}
