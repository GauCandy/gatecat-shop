import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { removeCartItem, updateCartItemQuantity } from "@/lib/cart";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }
  const { quantity } = (body ?? {}) as { quantity?: unknown };
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) {
    return NextResponse.json({ error: "Số lượng không hợp lệ" }, { status: 400 });
  }

  try {
    const item = await updateCartItemQuantity(user.id, id, quantity);
    return NextResponse.json({ item });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Không cập nhật được";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const removed = await removeCartItem(user.id, id);
  return NextResponse.json({ removed });
}
