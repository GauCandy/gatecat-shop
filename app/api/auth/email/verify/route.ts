import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { pool } from "@/lib/db";
import { cookieSecure } from "@/lib/env";
import { verifyOtp } from "@/lib/email-otp";
import { createSession, SESSION_COOKIE } from "@/lib/session";
import { isUserBanned } from "@/lib/users";
import { sendLoginNotification } from "@/lib/login-notify";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "Email không hợp lệ.",
  no_otp: "Không tìm thấy mã, vui lòng yêu cầu mã mới.",
  expired: "Mã đã hết hạn, vui lòng yêu cầu mã mới.",
  wrong_code: "Mã không đúng.",
  too_many_attempts: "Sai mã quá nhiều lần. Vui lòng yêu cầu mã mới.",
};

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  }

  const b = body as { email?: unknown; code?: unknown };
  const email = typeof b.email === "string" ? b.email : "";
  const code = typeof b.code === "string" ? b.code : "";

  if (!email || !code) {
    return NextResponse.json({ error: "Thiếu email hoặc mã." }, { status: 400 });
  }

  const result = await verifyOtp(email, code);
  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.error] ?? "Xác thực thất bại." },
      { status: 400 }
    );
  }

  // Find or create the user.
  let userId: string;
  let userName: string;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: users } = await client.query<{ id: string; name: string }>(
      `SELECT id, name FROM users WHERE email = $1 LIMIT 1`,
      [result.email]
    );

    if (users[0]) {
      userId = users[0].id;
      userName = users[0].name;
    } else {
      userId = crypto.randomUUID();
      userName = nameFromEmail(result.email);
      await client.query(
        `INSERT INTO users (id, name, email) VALUES ($1, $2, $3)`,
        [userId, userName, result.email]
      );
    }

    await client.query(
      `INSERT INTO auth_methods (id, provider, provider_account_id, user_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (provider, provider_account_id) DO NOTHING`,
      [crypto.randomUUID(), "email", result.email, userId]
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("email otp signin failed", e);
    return NextResponse.json({ error: "Lỗi máy chủ, vui lòng thử lại." }, { status: 500 });
  } finally {
    client.release();
  }

  // Chặn login nếu tài khoản đã bị cấm
  const banInfo = await isUserBanned(userId);
  if (banInfo) {
    const res = NextResponse.json(
      {
        error: "banned",
        reason: banInfo.reason,
        bannedAt: banInfo.bannedAt.toISOString(),
      },
      { status: 403 }
    );
    res.cookies.set(
      "ban_info",
      JSON.stringify({
        reason: banInfo.reason,
        bannedAt: banInfo.bannedAt.toISOString(),
        email: result.email,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: cookieSecure,
        path: "/",
        maxAge: 120,
      }
    );
    return res;
  }

  const userAgent = req.headers.get("user-agent") ?? undefined;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
  const { token, expiresAt } = await createSession(userId, { userAgent, ip });

  // Fire-and-forget login notification (don't block response).
  void sendLoginNotification({
    email: result.email,
    name: userName,
    method: "email",
    ip,
    userAgent,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,
    path: "/",
    expires: expiresAt,
  });
  return res;
}
