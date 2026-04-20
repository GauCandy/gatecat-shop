import { NextRequest, NextResponse } from "next/server";
import { requestBase } from "@/lib/env";
import { deleteSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);

  const res = NextResponse.redirect(new URL("/", requestBase(req)), { status: 303 });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
