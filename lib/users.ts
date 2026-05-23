import { pool } from "./db";

export type UserRole = "USER" | "ADMIN" | "SHIPPER";

export type Gender = "male" | "female" | "other";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
  orderCount: number;
  isBanned: boolean;
  banReason: string | null;
  bannedAt: Date | null;
};

export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role::text AS role,
            u.avatar_url AS "avatarUrl",
            u.created_at AS "createdAt",
            u.is_banned  AS "isBanned",
            u.ban_reason AS "banReason",
            u.banned_at  AS "bannedAt",
            COALESCE(o.cnt, 0)::int AS "orderCount"
     FROM users u
     LEFT JOIN (SELECT user_id, COUNT(*)::int AS cnt FROM orders GROUP BY user_id) o
       ON o.user_id = u.id
     ORDER BY u.created_at DESC`
  );
  return rows as AdminUserRow[];
}

export type BanInfo = {
  reason: string | null;
  bannedAt: Date;
};

export async function getBanInfoByEmail(email: string): Promise<BanInfo | null> {
  const { rows } = await pool.query<BanInfo>(
    `SELECT ban_reason AS reason, banned_at AS "bannedAt"
     FROM users
     WHERE email = $1 AND is_banned = TRUE
     LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function isUserBanned(userId: string): Promise<BanInfo | null> {
  const { rows } = await pool.query<BanInfo>(
    `SELECT ban_reason AS reason, banned_at AS "bannedAt"
     FROM users
     WHERE id = $1 AND is_banned = TRUE
     LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

export async function banUser(
  userId: string,
  reason: string
): Promise<AdminUserRow | null> {
  const trimmed = reason.trim();
  if (!trimmed) throw new Error("Lý do cấm không được để trống");
  if (trimmed.length > 500) throw new Error("Lý do cấm quá dài (tối đa 500 ký tự)");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE users
       SET is_banned = TRUE,
           ban_reason = $2,
           banned_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, role::text AS role,
                 avatar_url AS "avatarUrl",
                 created_at AS "createdAt",
                 is_banned  AS "isBanned",
                 ban_reason AS "banReason",
                 banned_at  AS "bannedAt"`,
      [userId, trimmed]
    );
    if (!rows.length) {
      await client.query("ROLLBACK");
      return null;
    }
    // Đá session hiện tại của user ra khỏi hệ thống
    await client.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
    await client.query("COMMIT");
    return { ...rows[0], orderCount: 0 } as AdminUserRow;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function unbanUser(userId: string): Promise<AdminUserRow | null> {
  const { rows } = await pool.query(
    `UPDATE users
     SET is_banned = FALSE,
         ban_reason = NULL,
         banned_at = NULL,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role::text AS role,
               avatar_url AS "avatarUrl",
               created_at AS "createdAt",
               is_banned  AS "isBanned",
               ban_reason AS "banReason",
               banned_at  AS "bannedAt"`,
    [userId]
  );
  if (!rows.length) return null;
  return { ...rows[0], orderCount: 0 } as AdminUserRow;
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<AdminUserRow | null> {
  if (!["USER", "ADMIN", "SHIPPER"].includes(role)) {
    throw new Error("Vai trò không hợp lệ");
  }
  const { rows } = await pool.query(
    `UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1
     RETURNING id, name, email, role::text AS role,
               avatar_url AS "avatarUrl",
               created_at AS "createdAt",
               is_banned  AS "isBanned",
               ban_reason AS "banReason",
               banned_at  AS "bannedAt"`,
    [userId, role]
  );
  if (!rows.length) return null;
  return { ...rows[0], orderCount: 0 } as AdminUserRow;
}

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { rows } = await pool.query<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    phone: string | null;
    dateOfBirth: Date | null;
    gender: Gender | null;
  }>(
    `SELECT id, name, email,
            avatar_url    AS "avatarUrl",
            phone,
            date_of_birth AS "dateOfBirth",
            gender
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );
  const u = rows[0];
  if (!u) return null;
  return {
    ...u,
    dateOfBirth: u.dateOfBirth ? u.dateOfBirth.toISOString().slice(0, 10) : null,
  };
}

export type ProfileInput = {
  name: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
};

const VN_PHONE = /^(0|\+84)(\d){9}$/;

export function validateProfile(input: ProfileInput): string | null {
  if (!input.name.trim()) return "Tên không được để trống";
  if (input.name.trim().length > 100) return "Tên quá dài";
  if (input.phone && !VN_PHONE.test(input.phone))
    return "Số điện thoại không hợp lệ";
  if (input.dateOfBirth) {
    const d = new Date(input.dateOfBirth);
    if (Number.isNaN(d.getTime())) return "Ngày sinh không hợp lệ";
    if (d.getTime() > Date.now()) return "Ngày sinh không hợp lệ";
  }
  if (input.gender && !["male", "female", "other"].includes(input.gender))
    return "Giới tính không hợp lệ";
  return null;
}

export async function updateUserProfile(
  userId: string,
  input: ProfileInput
): Promise<UserProfile | null> {
  const err = validateProfile(input);
  if (err) throw new Error(err);

  await pool.query(
    `UPDATE users
     SET name = $2,
         phone = $3,
         date_of_birth = $4,
         gender = $5,
         updated_at = NOW()
     WHERE id = $1`,
    [
      userId,
      input.name.trim(),
      input.phone?.trim() || null,
      input.dateOfBirth || null,
      input.gender || null,
    ]
  );
  return getUserProfile(userId);
}
