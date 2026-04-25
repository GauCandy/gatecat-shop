import crypto from "node:crypto";
import { pool } from "./db";

export type Address = {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressLine: string;
  note: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressInput = {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressLine: string;
  note: string | null;
  isDefault: boolean;
};

const SELECT_COLS = `
  id,
  user_id         AS "userId",
  recipient_name  AS "recipientName",
  phone,
  province,
  district,
  ward,
  address_line    AS "addressLine",
  note,
  is_default      AS "isDefault",
  created_at      AS "createdAt",
  updated_at      AS "updatedAt"
`;

const VN_PHONE = /^(0|\+84)(\d){9}$/;

export function validateAddress(input: AddressInput): string | null {
  if (!input.recipientName.trim()) return "Tên người nhận không được để trống";
  if (input.recipientName.trim().length > 100) return "Tên quá dài";
  if (!VN_PHONE.test(input.phone)) return "Số điện thoại không hợp lệ";
  if (!input.province.trim()) return "Tỉnh/Thành phố không được để trống";
  if (!input.district.trim()) return "Quận/Huyện không được để trống";
  if (!input.ward.trim()) return "Phường/Xã không được để trống";
  if (!input.addressLine.trim()) return "Địa chỉ không được để trống";
  return null;
}

export async function listAddresses(userId: string): Promise<Address[]> {
  const { rows } = await pool.query<Address>(
    `SELECT ${SELECT_COLS}
     FROM addresses
     WHERE user_id = $1
     ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getAddress(
  userId: string,
  id: string
): Promise<Address | null> {
  const { rows } = await pool.query<Address>(
    `SELECT ${SELECT_COLS} FROM addresses WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [id, userId]
  );
  return rows[0] ?? null;
}

async function clearDefault(
  client: import("pg").PoolClient,
  userId: string
): Promise<void> {
  await client.query(
    "UPDATE addresses SET is_default = FALSE, updated_at = NOW() WHERE user_id = $1 AND is_default = TRUE",
    [userId]
  );
}

export async function createAddress(
  userId: string,
  input: AddressInput
): Promise<Address> {
  const err = validateAddress(input);
  if (err) throw new Error(err);

  const id = crypto.randomUUID();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: existing } = await client.query<{ n: number }>(
      "SELECT COUNT(*)::int AS n FROM addresses WHERE user_id = $1",
      [userId]
    );
    const isFirst = (existing[0]?.n ?? 0) === 0;
    const makeDefault = isFirst || input.isDefault;
    if (makeDefault) await clearDefault(client, userId);

    await client.query(
      `INSERT INTO addresses
        (id, user_id, recipient_name, phone, province, district, ward, address_line, note, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        userId,
        input.recipientName.trim(),
        input.phone.trim(),
        input.province.trim(),
        input.district.trim(),
        input.ward.trim(),
        input.addressLine.trim(),
        input.note?.trim() || null,
        makeDefault,
      ]
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  const saved = await getAddress(userId, id);
  if (!saved) throw new Error("Không lưu được địa chỉ");
  return saved;
}

export async function updateAddress(
  userId: string,
  id: string,
  input: AddressInput
): Promise<Address | null> {
  const err = validateAddress(input);
  if (err) throw new Error(err);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rowCount } = await client.query(
      "SELECT 1 FROM addresses WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (!rowCount) {
      await client.query("ROLLBACK");
      return null;
    }

    if (input.isDefault) await clearDefault(client, userId);

    await client.query(
      `UPDATE addresses
       SET recipient_name = $3,
           phone = $4,
           province = $5,
           district = $6,
           ward = $7,
           address_line = $8,
           note = $9,
           is_default = $10,
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [
        id,
        userId,
        input.recipientName.trim(),
        input.phone.trim(),
        input.province.trim(),
        input.district.trim(),
        input.ward.trim(),
        input.addressLine.trim(),
        input.note?.trim() || null,
        input.isDefault,
      ]
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  return getAddress(userId, id);
}

export async function deleteAddress(
  userId: string,
  id: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ isDefault: boolean }>(
      `SELECT is_default AS "isDefault" FROM addresses WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    const target = rows[0];
    if (!target) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(
      "DELETE FROM addresses WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (target.isDefault) {
      await client.query(
        `UPDATE addresses
         SET is_default = TRUE, updated_at = NOW()
         WHERE id = (
           SELECT id FROM addresses
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 1
         )`,
        [userId]
      );
    }
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function setDefaultAddress(
  userId: string,
  id: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rowCount } = await client.query(
      "SELECT 1 FROM addresses WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (!rowCount) {
      await client.query("ROLLBACK");
      return false;
    }
    await clearDefault(client, userId);
    await client.query(
      `UPDATE addresses SET is_default = TRUE, updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
