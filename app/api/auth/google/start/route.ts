import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { googleAuthUrl, googleRedirectUri } from "@/lib/oauth";
import { cookieSecure } from "@/lib/env";

export async function GET(req: NextRequest) {
  const state = crypto.randomBytes(16).toString("base64url");
  const redirectUri = googleRedirectUri(req);

  const res = NextResponse.redirect(googleAuthUrl({ redirectUri, state }));
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,
    path: "/",
    maxAge: 600,
  });
  return res;
}
