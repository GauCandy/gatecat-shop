import crypto from "node:crypto";
import { pool } from "./db";

export type CartItem = {
  id: string;
  quantity: number;
  variantId: string;
  sku: string;
  variantImageUrl: string | null;
  listPrice: number;
  salePrice: number;
  stock: number;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
};

const SELECT_ITEMS = `
  SELECT ci.id,
         ci.quantity,
         ci.variant_id         AS "variantId",
         v.sku,
         v.image_url           AS "variantImageUrl",
         v.list_price          AS "listPrice",
         v.sale_price          AS "salePrice",
         v.stock,
         p.id                  AS "productId",
         p.name                AS "productName",
         p.slug                AS "productSlug",
         p.image_url           AS "productImageUrl"
  FROM cart_items ci
  JOIN product_variants v ON v.id = ci.variant_id
  JOIN products p ON p.id = v.product_id
  WHERE ci.user_id = $1
  ORDER BY ci.updated_at DESC
`;

export async function listCartItems(userId: string): Promise<CartItem[]> {
  const { rows } = await pool.query<CartItem>(SELECT_ITEMS, [userId]);
  return rows;
}

export async function getCartCount(userId: string): Promise<number> {
  const { rows } = await pool.query<{ total: string | number | null }>(
    "SELECT COALESCE(SUM(quantity), 0) AS total FROM cart_items WHERE user_id = $1",
    [userId]
  );
  const raw = rows[0]?.total ?? 0;
  return typeof raw === "number" ? raw : parseInt(String(raw), 10) || 0;
}

export async function addCartItem(
  userId: string,
  variantId: string,
  quantity: number
): Promise<CartItem> {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Số lượng không hợp lệ");
  }

  const { rows: variantRows } = await pool.query<{
    id: string;
    stock: number;
  }>(
    "SELECT id, stock FROM product_variants WHERE id = $1 LIMIT 1",
    [variantId]
  );
  const variant = variantRows[0];
  if (!variant) throw new Error("Mã sản phẩm không tồn tại");
  if (variant.stock <= 0) throw new Error("Sản phẩm đã hết hàng");

  const id = crypto.randomUUID();
  const { rows } = await pool.query<{ id: string; quantity: number }>(
    `INSERT INTO cart_items (id, user_id, variant_id, quantity)
     VALUES ($1, $2, $3, LEAST($4::int, $5::int))
     ON CONFLICT (user_id, variant_id)
     DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $5::int),
                   updated_at = NOW()
     RETURNING id, quantity`,
    [id, userId, variantId, quantity, variant.stock]
  );

  const itemId = rows[0].id;
  const { rows: itemRows } = await pool.query<CartItem>(
    `${SELECT_ITEMS.replace("WHERE ci.user_id = $1", "WHERE ci.user_id = $1 AND ci.id = $2")}`,
    [userId, itemId]
  );
  if (!itemRows[0]) throw new Error("Không lấy được giỏ hàng");
  return itemRows[0];
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number
): Promise<CartItem | null> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Số lượng không hợp lệ");
  }

  if (quantity === 0) {
    await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND user_id = $2",
      [itemId, userId]
    );
    return null;
  }

  const { rows: stockRows } = await pool.query<{ stock: number }>(
    `SELECT v.stock
     FROM cart_items ci
     JOIN product_variants v ON v.id = ci.variant_id
     WHERE ci.id = $1 AND ci.user_id = $2
     LIMIT 1`,
    [itemId, userId]
  );
  if (!stockRows[0]) return null;
  const capped = Math.min(quantity, stockRows[0].stock);
  if (capped <= 0) {
    await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND user_id = $2",
      [itemId, userId]
    );
    return null;
  }

  await pool.query(
    `UPDATE cart_items
     SET quantity = $3, updated_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [itemId, userId, capped]
  );

  const { rows } = await pool.query<CartItem>(
    `${SELECT_ITEMS.replace("WHERE ci.user_id = $1", "WHERE ci.user_id = $1 AND ci.id = $2")}`,
    [userId, itemId]
  );
  return rows[0] ?? null;
}

export async function removeCartItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const res = await pool.query(
    "DELETE FROM cart_items WHERE id = $1 AND user_id = $2",
    [itemId, userId]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function clearCart(userId: string): Promise<void> {
  await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
}
