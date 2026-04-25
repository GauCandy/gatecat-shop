import crypto from "node:crypto";
import type { PoolClient } from "pg";
import { pool } from "./db";

export type VoucherVisibility = "public" | "private";
export type VoucherDiscountType = "percent" | "amount";

export type Voucher = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  visibility: VoucherVisibility;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderTotal: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type VoucherInput = {
  code: string;
  name: string;
  description?: string | null;
  visibility: VoucherVisibility;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderTotal?: number | null;
  usageLimit?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
};

const VOUCHER_SELECT = `
  id,
  code,
  name,
  description,
  visibility::text AS "visibility",
  discount_type::text AS "discountType",
  discount_value AS "discountValue",
  max_discount AS "maxDiscount",
  min_order_total AS "minOrderTotal",
  usage_limit AS "usageLimit",
  used_count AS "usedCount",
  expires_at AS "expiresAt",
  is_active AS "isActive",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function normalizeRow(row: Record<string, unknown>): Voucher {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    visibility: row.visibility as VoucherVisibility,
    discountType: row.discountType as VoucherDiscountType,
    discountValue: Number(row.discountValue),
    maxDiscount: row.maxDiscount == null ? null : Number(row.maxDiscount),
    minOrderTotal: row.minOrderTotal == null ? null : Number(row.minOrderTotal),
    usageLimit: row.usageLimit == null ? null : Number(row.usageLimit),
    usedCount: Number(row.usedCount),
    expiresAt: (row.expiresAt as Date | null) ?? null,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date,
  };
}

export async function listAllVouchers(): Promise<Voucher[]> {
  const res = await pool.query(
    `SELECT ${VOUCHER_SELECT} FROM vouchers ORDER BY created_at DESC`
  );
  return res.rows.map(normalizeRow);
}

export async function listAvailableVouchersForUser(userId: string): Promise<Voucher[]> {
  const res = await pool.query(
    `
    SELECT ${VOUCHER_SELECT}
    FROM vouchers v
    WHERE v.visibility = 'public'
      AND v.is_active = true
      AND (v.expires_at IS NULL OR v.expires_at > NOW())
      AND (v.usage_limit IS NULL OR v.used_count < v.usage_limit)
      AND NOT EXISTS (
        SELECT 1 FROM voucher_redemptions r
        WHERE r.voucher_id = v.id AND r.user_id = $1
      )
    ORDER BY v.created_at DESC
    `,
    [userId]
  );
  return res.rows.map(normalizeRow);
}

function sanitizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function validateInput(input: VoucherInput): string | null {
  if (!input.code?.trim()) return "Mã voucher là bắt buộc";
  if (!input.name?.trim()) return "Tên voucher là bắt buộc";
  if (input.discountType !== "percent" && input.discountType !== "amount")
    return "Loại giảm giá không hợp lệ";
  if (input.visibility !== "public" && input.visibility !== "private")
    return "Kiểu hiển thị không hợp lệ";
  if (!(input.discountValue > 0)) return "Giá trị giảm phải lớn hơn 0";
  if (input.discountType === "percent" && input.discountValue > 100)
    return "Giảm theo % không vượt quá 100";
  if (input.maxDiscount != null && input.maxDiscount <= 0)
    return "Mức giảm tối đa phải lớn hơn 0";
  if (input.minOrderTotal != null && input.minOrderTotal < 0)
    return "Đơn tối thiểu không âm";
  if (input.usageLimit != null && input.usageLimit <= 0)
    return "Lượt sử dụng phải lớn hơn 0";
  return null;
}

export async function createVoucher(input: VoucherInput): Promise<Voucher> {
  const err = validateInput(input);
  if (err) throw new Error(err);

  const id = crypto.randomUUID();
  const code = sanitizeCode(input.code);
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

  try {
    const res = await pool.query(
      `
      INSERT INTO vouchers (
        id, code, name, description, visibility, discount_type, discount_value,
        max_discount, min_order_total, usage_limit, expires_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING ${VOUCHER_SELECT}
      `,
      [
        id,
        code,
        input.name.trim(),
        input.description?.trim() || null,
        input.visibility,
        input.discountType,
        input.discountValue,
        input.maxDiscount ?? null,
        input.minOrderTotal ?? null,
        input.usageLimit ?? null,
        expiresAt,
        input.isActive ?? true,
      ]
    );
    return normalizeRow(res.rows[0]);
  } catch (e) {
    if (e instanceof Error && /unique/i.test(e.message))
      throw new Error("Mã voucher đã tồn tại");
    throw e;
  }
}

export async function updateVoucher(id: string, input: VoucherInput): Promise<Voucher> {
  const err = validateInput(input);
  if (err) throw new Error(err);

  const code = sanitizeCode(input.code);
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

  try {
    const res = await pool.query(
      `
      UPDATE vouchers SET
        code = $2,
        name = $3,
        description = $4,
        visibility = $5,
        discount_type = $6,
        discount_value = $7,
        max_discount = $8,
        min_order_total = $9,
        usage_limit = $10,
        expires_at = $11,
        is_active = $12,
        updated_at = NOW()
      WHERE id = $1
      RETURNING ${VOUCHER_SELECT}
      `,
      [
        id,
        code,
        input.name.trim(),
        input.description?.trim() || null,
        input.visibility,
        input.discountType,
        input.discountValue,
        input.maxDiscount ?? null,
        input.minOrderTotal ?? null,
        input.usageLimit ?? null,
        expiresAt,
        input.isActive ?? true,
      ]
    );
    if (!res.rows.length) throw new Error("Voucher không tồn tại");
    return normalizeRow(res.rows[0]);
  } catch (e) {
    if (e instanceof Error && /unique/i.test(e.message))
      throw new Error("Mã voucher đã tồn tại");
    throw e;
  }
}

export async function deleteVoucher(id: string): Promise<void> {
  await pool.query("DELETE FROM vouchers WHERE id = $1", [id]);
}

export function computeDiscount(voucher: Voucher, subtotal: number): number {
  let discount = 0;
  if (voucher.discountType === "percent") {
    discount = Math.floor((subtotal * voucher.discountValue) / 100);
  } else {
    discount = voucher.discountValue;
  }
  if (voucher.maxDiscount != null && discount > voucher.maxDiscount) {
    discount = voucher.maxDiscount;
  }
  if (discount > subtotal) discount = subtotal;
  return discount;
}

export type ValidationOk = {
  ok: true;
  voucher: Voucher;
  discount: number;
};

export type ValidationFail = {
  ok: false;
  error: string;
};

export async function validateVoucherForUser(
  userId: string,
  code: string,
  subtotal: number
): Promise<ValidationOk | ValidationFail> {
  const normalized = sanitizeCode(code);
  if (!normalized) return { ok: false, error: "Thiếu mã voucher" };

  const res = await pool.query(
    `SELECT ${VOUCHER_SELECT} FROM vouchers WHERE code = $1 LIMIT 1`,
    [normalized]
  );
  if (!res.rows.length) return { ok: false, error: "Mã voucher không tồn tại" };

  const voucher = normalizeRow(res.rows[0]);

  if (!voucher.isActive) return { ok: false, error: "Voucher đã bị tắt" };
  if (voucher.expiresAt && voucher.expiresAt.getTime() <= Date.now())
    return { ok: false, error: "Voucher đã hết hạn" };
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit)
    return { ok: false, error: "Voucher đã hết lượt sử dụng" };
  if (voucher.minOrderTotal != null && subtotal < voucher.minOrderTotal)
    return {
      ok: false,
      error: `Đơn tối thiểu ${voucher.minOrderTotal.toLocaleString("vi-VN")}đ`,
    };

  const used = await pool.query(
    `SELECT 1 FROM voucher_redemptions WHERE voucher_id = $1 AND user_id = $2 LIMIT 1`,
    [voucher.id, userId]
  );
  if (used.rows.length)
    return { ok: false, error: "Bạn đã sử dụng voucher này rồi" };

  return { ok: true, voucher, discount: computeDiscount(voucher, subtotal) };
}

export async function redeemVoucherInTransaction(
  client: PoolClient,
  params: {
    code: string;
    userId: string;
    orderId: string;
    subtotal: number;
  }
): Promise<{ voucherId: string; discount: number } | null> {
  const normalized = sanitizeCode(params.code);
  if (!normalized) return null;

  const lockRes = await client.query(
    `SELECT ${VOUCHER_SELECT} FROM vouchers WHERE code = $1 FOR UPDATE`,
    [normalized]
  );
  if (!lockRes.rows.length) throw new Error("Mã voucher không tồn tại");
  const voucher = normalizeRow(lockRes.rows[0]);

  if (!voucher.isActive) throw new Error("Voucher đã bị tắt");
  if (voucher.expiresAt && voucher.expiresAt.getTime() <= Date.now())
    throw new Error("Voucher đã hết hạn");
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit)
    throw new Error("Voucher đã hết lượt sử dụng");
  if (voucher.minOrderTotal != null && params.subtotal < voucher.minOrderTotal)
    throw new Error(
      `Đơn tối thiểu ${voucher.minOrderTotal.toLocaleString("vi-VN")}đ để dùng voucher`
    );

  const discount = computeDiscount(voucher, params.subtotal);

  try {
    await client.query(
      `INSERT INTO voucher_redemptions (id, voucher_id, user_id, order_id, discount_amount)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), voucher.id, params.userId, params.orderId, discount]
    );
  } catch (e) {
    if (e instanceof Error && /unique/i.test(e.message))
      throw new Error("Bạn đã sử dụng voucher này rồi");
    throw e;
  }

  await client.query(
    `UPDATE vouchers SET used_count = used_count + 1, updated_at = NOW() WHERE id = $1`,
    [voucher.id]
  );

  return { voucherId: voucher.id, discount };
}
