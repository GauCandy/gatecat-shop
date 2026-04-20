import crypto from "node:crypto";
import { pool } from "./db";

const SESSION_DAYS = 30;
export const SESSION_COOKIE = "session";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string; ip?: string }
) {
  const token = crypto.randomBytes(32).toString("base64url");
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400 * 1000);

  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at, user_agent, ip)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, userId, expiresAt, meta.userAgent ?? null, meta.ip ?? null]
  );

  return { token, expiresAt };
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SHIPPER";
  avatarUrl: string | null;
};

export async function getSessionUser(
  token: string | undefined
): Promise<SessionUser | null> {
  if (!token) return null;
  const id = hashToken(token);

  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_url AS "avatarUrl"
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > NOW()
     LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function deleteSession(token: string) {
  const id = hashToken(token);
  await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
}
