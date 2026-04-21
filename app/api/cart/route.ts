import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { addCartItem, listCartItems } from "@/lib/cart";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await listCartItems(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }
  const { variantId, quantity } = (body ?? {}) as {
    variantId?: unknown;
    quantity?: unknown;
  };
  if (typeof variantId !== "string" || !variantId) {
    return NextResponse.json({ error: "Thiếu variantId" }, { status: 400 });
  }
  const qty = typeof quantity === "number" ? quantity : 1;
  if (!Number.isInteger(qty) || qty <= 0) {
    return NextResponse.json({ error: "Số lượng không hợp lệ" }, { status: 400 });
  }

  try {
    const item = await addCartItem(user.id, variantId, qty);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Không thêm được vào giỏ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
