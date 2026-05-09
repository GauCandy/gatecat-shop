import crypto from "node:crypto";
import { pool } from "@/lib/db";
import { getAddress } from "@/lib/addresses";
import { listCartItemsById } from "@/lib/cart";
import { redeemVoucherInTransaction } from "@/lib/vouchers";

export type OrderItem = {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantSku: string;
  variantImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
};

export type DeliveryMethod = "delivery" | "pickup";

export type Order = {
  id: string;
  userId: string;
  recipientName: string | null;
  phone: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  addressLine: string | null;
  note: string | null;
  paymentMethod: string;
  deliveryMethod: DeliveryMethod;
  status: string;
  totalAmount: number;
  discountAmount: number;
  voucherCode: string | null;
  trackingCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
};

export type ShipperOrderRow = {
  id: string;
  userId: string;
  recipientName: string | null;
  phone: string | null;
  addressLine: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  totalAmount: number;
  status: string;
  deliveryMethod: DeliveryMethod;
  trackingCode: string | null;
  createdAt: Date;
};

export async function createOrder(
  userId: string,
  {
    cartItemIds,
    addressId,
    voucherCode,
    deliveryMethod = "delivery",
  }: {
    cartItemIds: string[];
    addressId: string | null;
    voucherCode?: string | null;
    deliveryMethod?: DeliveryMethod;
  }
): Promise<Order> {
  if (!cartItemIds.length) throw new Error("No items selected");

  let address: Awaited<ReturnType<typeof getAddress>> = null;
  if (deliveryMethod === "delivery") {
    if (!addressId) throw new Error("Address is required for delivery");
    address = await getAddress(userId, addressId);
    if (!address) throw new Error("Address not found");
  }

  const cartItems = await listCartItemsById(userId, cartItemIds);
  if (cartItems.length !== cartItemIds.length) {
    throw new Error("Some cart items not found");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const variantIds = cartItems.map((i) => i.variantId);
    const stockRes = await client.query<{ id: string; stock: number }>(
      `SELECT id, stock FROM product_variants WHERE id = ANY($1) FOR UPDATE`,
      [variantIds]
    );
    const stockMap = new Map(stockRes.rows.map((r) => [r.id, Number(r.stock)]));
    for (const item of cartItems) {
      const live = stockMap.get(item.variantId) ?? 0;
      if (live < item.quantity) {
        throw new Error(`Sản phẩm "${item.productName}" không đủ hàng`);
      }
    }

    const subtotalBig = cartItems.reduce(
      (sum, item) => sum + BigInt(item.salePrice) * BigInt(item.quantity),
      0n
    );
    const subtotal = Number(subtotalBig);

    const orderId = crypto.randomUUID();

    // Create order first (without voucher info) so the FK reference exists
    await client.query(
      `
      INSERT INTO orders (
        id, user_id, recipient_name, phone, province, district, ward,
        address_line, note, payment_method, delivery_method, status, total_amount,
        voucher_id, discount_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `,
      [
        orderId,
        userId,
        address?.recipientName ?? null,
        address?.phone ?? null,
        address?.province ?? null,
        address?.district ?? null,
        address?.ward ?? null,
        address?.addressLine ?? null,
        address?.note || null,
        "cod",
        deliveryMethod,
        "pending",
        subtotalBig.toString(),
        null,
        "0",
      ]
    );

    // Redeem voucher AFTER order exists (so FK on voucher_redemptions.order_id is satisfied)
    let voucherId: string | null = null;
    let discountAmount = 0;
    if (voucherCode && voucherCode.trim()) {
      const redeemed = await redeemVoucherInTransaction(client, {
        code: voucherCode,
        userId,
        orderId,
        subtotal,
      });
      if (redeemed) {
        voucherId = redeemed.voucherId;
        discountAmount = redeemed.discount;
      }
    }

    // Update order with final total and voucher info
    const finalTotal = subtotalBig - BigInt(discountAmount);
    await client.query(
      `UPDATE orders SET total_amount = $2, voucher_id = $3, discount_amount = $4 WHERE id = $1`,
      [orderId, finalTotal.toString(), voucherId, discountAmount.toString()]
    );

    for (const item of cartItems) {
      const itemId = crypto.randomUUID();
      const subtotal = BigInt(item.salePrice) * BigInt(item.quantity);
      await client.query(
        `
        INSERT INTO order_items (
          id, order_id, variant_id, product_name, variant_sku,
          variant_image_url, unit_price, quantity, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          itemId,
          orderId,
          item.variantId,
          item.productName,
          item.sku,
          item.variantImageUrl || null,
          item.salePrice.toString(),
          item.quantity,
          subtotal.toString(),
        ]
      );

      await client.query(
        `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.variantId]
      );
    }

    await client.query(
      `DELETE FROM cart_items WHERE id = ANY($1) AND user_id = $2`,
      [cartItemIds, userId]
    );

    await client.query("COMMIT");

    return getOrder(userId, orderId);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

const REFUND_STATUSES = new Set(["returned", "cancelled"]);

export async function changeOrderStatus(
  client: import("pg").PoolClient,
  orderId: string,
  newStatus: string,
  opts?: { trackingCode?: string | null | undefined }
): Promise<{ id: string; status: string; trackingCode: string | null } | null> {
  const cur = await client.query(
    `SELECT status::text AS status, stock_restored
     FROM orders WHERE id = $1 FOR UPDATE`,
    [orderId]
  );
  if (!cur.rows.length) return null;
  const currentStatus = cur.rows[0].status as string;
  const stockRestored = Boolean(cur.rows[0].stock_restored);

  const goingIntoRefund = REFUND_STATUSES.has(newStatus);
  const leavingRefund = !goingIntoRefund && REFUND_STATUSES.has(currentStatus);

  if (goingIntoRefund && !stockRestored) {
    const items = await client.query(
      `SELECT variant_id, quantity FROM order_items WHERE order_id = $1`,
      [orderId]
    );
    for (const item of items.rows) {
      await client.query(
        `UPDATE product_variants SET stock = stock + $1 WHERE id = $2`,
        [item.quantity, item.variant_id]
      );
    }
    await client.query(
      `UPDATE orders SET stock_restored = TRUE WHERE id = $1`,
      [orderId]
    );
  } else if (leavingRefund && stockRestored) {
    const items = await client.query<{ variant_id: string; quantity: number }>(
      `SELECT variant_id, quantity FROM order_items WHERE order_id = $1`,
      [orderId]
    );
    const variantIds = items.rows.map((i) => i.variant_id);
    const stockRes = await client.query<{ id: string; stock: number }>(
      `SELECT id, stock FROM product_variants WHERE id = ANY($1) FOR UPDATE`,
      [variantIds]
    );
    const stockMap = new Map(stockRes.rows.map((r) => [r.id, Number(r.stock)]));
    for (const item of items.rows) {
      const live = stockMap.get(item.variant_id) ?? 0;
      if (live < item.quantity) {
        throw new Error("Không đủ tồn kho để khôi phục đơn về trạng thái này");
      }
    }
    for (const item of items.rows) {
      await client.query(
        `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.variant_id]
      );
    }
    await client.query(
      `UPDATE orders SET stock_restored = FALSE WHERE id = $1`,
      [orderId]
    );
  }

  let upd;
  if (opts && Object.prototype.hasOwnProperty.call(opts, "trackingCode")) {
    upd = await client.query(
      `UPDATE orders SET status = $2, tracking_code = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING id, status::text AS status, tracking_code AS "trackingCode"`,
      [orderId, newStatus, opts.trackingCode ?? null]
    );
  } else {
    upd = await client.query(
      `UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1
       RETURNING id, status::text AS status, tracking_code AS "trackingCode"`,
      [orderId, newStatus]
    );
  }

  return upd.rows[0] ?? null;
}

export async function getOrder(userId: string, orderId: string): Promise<Order> {
  const result = await pool.query(
    `
    SELECT
      o.id, o.user_id, o.recipient_name, o.phone, o.province, o.district, o.ward,
      o.address_line, o.note, o.payment_method, o.delivery_method::text AS delivery_method,
      o.status, o.total_amount,
      o.discount_amount, v.code AS voucher_code,
      o.created_at, o.updated_at
    FROM orders o
    LEFT JOIN vouchers v ON v.id = o.voucher_id
    WHERE o.id = $1 AND o.user_id = $2
    `,
    [orderId, userId]
  );

  if (!result.rows.length) throw new Error("Order not found");

  const order = result.rows[0];

  const itemsResult = await pool.query(
    `
    SELECT
      id, order_id as "orderId", variant_id as "variantId", product_name as "productName",
      variant_sku as "variantSku", variant_image_url as "variantImageUrl",
      unit_price as "unitPrice", quantity, subtotal, created_at as "createdAt"
    FROM order_items
    WHERE order_id = $1
    ORDER BY created_at
    `,
    [orderId]
  );

  return {
    id: order.id,
    userId: order.user_id,
    recipientName: order.recipient_name,
    phone: order.phone,
    province: order.province,
    district: order.district,
    ward: order.ward,
    addressLine: order.address_line,
    note: order.note,
    paymentMethod: order.payment_method,
    deliveryMethod: order.delivery_method as DeliveryMethod,
    status: order.status,
    totalAmount: Number(order.total_amount),
    discountAmount: Number(order.discount_amount ?? 0),
    voucherCode: order.voucher_code ?? null,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: itemsResult.rows.map((row) => ({
      ...row,
      unitPrice: Number(row.unitPrice),
      subtotal: Number(row.subtotal),
    })),
  };
}

export async function getOrderForShipper(orderId: string): Promise<Order | null> {
  const result = await pool.query(
    `
    SELECT
      o.id, o.user_id, o.recipient_name, o.phone, o.province, o.district, o.ward,
      o.address_line, o.note, o.payment_method, o.delivery_method::text AS delivery_method,
      o.status, o.total_amount,
      o.discount_amount, v.code AS voucher_code,
      o.created_at, o.updated_at, o.tracking_code
    FROM orders o
    LEFT JOIN vouchers v ON v.id = o.voucher_id
    WHERE o.id = $1
    `,
    [orderId]
  );

  if (!result.rows.length) return null;
  const order = result.rows[0];

  const itemsResult = await pool.query(
    `
    SELECT
      id, order_id as "orderId", variant_id as "variantId", product_name as "productName",
      variant_sku as "variantSku", variant_image_url as "variantImageUrl",
      unit_price as "unitPrice", quantity, subtotal, created_at as "createdAt"
    FROM order_items
    WHERE order_id = $1
    ORDER BY created_at
    `,
    [orderId]
  );

  return {
    id: order.id,
    userId: order.user_id,
    recipientName: order.recipient_name,
    phone: order.phone,
    province: order.province,
    district: order.district,
    ward: order.ward,
    addressLine: order.address_line,
    note: order.note,
    paymentMethod: order.payment_method,
    deliveryMethod: order.delivery_method as DeliveryMethod,
    status: order.status,
    totalAmount: Number(order.total_amount),
    discountAmount: Number(order.discount_amount ?? 0),
    voucherCode: order.voucher_code ?? null,
    trackingCode: order.tracking_code,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: itemsResult.rows.map((row) => ({
      ...row,
      unitPrice: Number(row.unitPrice),
      subtotal: Number(row.subtotal),
    })),
  };
}

export async function listOrders(userId: string): Promise<Order[]> {
  const result = await pool.query(
    `
    SELECT
      o.id, o.user_id, o.recipient_name, o.phone, o.province, o.district, o.ward,
      o.address_line, o.note, o.payment_method, o.delivery_method::text AS delivery_method,
      o.status, o.total_amount,
      o.discount_amount, v.code AS voucher_code,
      o.created_at, o.updated_at
    FROM orders o
    LEFT JOIN vouchers v ON v.id = o.voucher_id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    recipientName: row.recipient_name,
    phone: row.phone,
    province: row.province,
    district: row.district,
    ward: row.ward,
    addressLine: row.address_line,
    note: row.note,
    paymentMethod: row.payment_method,
    deliveryMethod: row.delivery_method as DeliveryMethod,
    status: row.status,
    totalAmount: Number(row.total_amount),
    discountAmount: Number(row.discount_amount ?? 0),
    voucherCode: row.voucher_code ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
