import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { isAdminRequest } from "@/lib/admin";
import { reorderProducts } from "@/lib/products";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === "string") : null;
  if (!ids) {
    return NextResponse.json({ error: "ids không hợp lệ" }, { status: 400 });
  }
  await reorderProducts(ids);
  return NextResponse.json({ ok: true });
}
