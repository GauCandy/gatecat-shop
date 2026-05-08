import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { pool } from "@/lib/db";
import { cookieSecure, requestBase } from "@/lib/env";
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  googleRedirectUri,
} from "@/lib/oauth";
import { createSession, SESSION_COOKIE } from "@/lib/session";
import { sendLoginNotification } from "@/lib/login-notify";

export async function GET(req: NextRequest) {
  const base = requestBase(req);
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/login?error=state", base));
  }

  const redirectUri = googleRedirectUri(req);

  let userId: string;
  let userEmail: string;
  let userName: string;
  try {
    const tokens = await exchangeGoogleCode({ code, redirectUri });
    const info = await fetchGoogleUserInfo(tokens.access_token);
    userEmail = info.email;
    userName = info.name;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: authRows } = await client.query(
        `SELECT user_id FROM auth_methods
         WHERE provider = $1 AND provider_account_id = $2`,
        ["google", info.sub]
      );

      const picture = info.picture ?? null;

      if (authRows.length > 0) {
        userId = authRows[0].user_id;
        await client.query(
          `UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2`,
          [picture, userId]
        );
      } else {
        const { rows: userRows } = await client.query(
          `SELECT id FROM users WHERE email = $1`,
          [info.email]
        );

        if (userRows.length > 0) {
          userId = userRows[0].id;
          await client.query(
            `UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2`,
            [picture, userId]
          );
        } else {
          userId = crypto.randomUUID();
          await client.query(
            `INSERT INTO users (id, name, email, avatar_url) VALUES ($1, $2, $3, $4)`,
            [userId, info.name, info.email, picture]
          );
        }

        await client.query(
          `INSERT INTO auth_methods (id, provider, provider_account_id, user_id)
           VALUES ($1, $2, $3, $4)`,
          [crypto.randomUUID(), "google", info.sub, userId]
        );
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("google oauth callback failed", e);
    return NextResponse.redirect(new URL("/login?error=oauth", base));
  }

  const userAgent = req.headers.get("user-agent") ?? undefined;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
  const { token, expiresAt } = await createSession(userId, { userAgent, ip });

  void sendLoginNotification({
    email: userEmail,
    name: userName,
    method: "google",
    ip,
    userAgent,
  });

  const res = NextResponse.redirect(new URL("/", base));
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,
    path: "/",
    expires: expiresAt,
  });
  res.cookies.delete("oauth_state");
  return res;
}
