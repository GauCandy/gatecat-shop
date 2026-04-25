import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { createOrder, listOrders } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { cartItemIds, addressId, voucherCode, deliveryMethod } = body;

    if (!Array.isArray(cartItemIds) || !cartItemIds.length) {
      return NextResponse.json(
        { error: "Không có sản phẩm được chọn" },
        { status: 400 }
      );
    }

    const method: "delivery" | "pickup" =
      deliveryMethod === "pickup" ? "pickup" : "delivery";

    if (method === "delivery" && !addressId) {
      return NextResponse.json(
        { error: "Vui lòng chọn địa chỉ giao hàng" },
        { status: 400 }
      );
    }

    const order = await createOrder(user.id, {
      cartItemIds,
      addressId: method === "delivery" ? addressId : null,
      voucherCode: typeof voucherCode === "string" ? voucherCode : null,
      deliveryMethod: method,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo đơn hàng";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const orders = await listOrders(user.id);
    return NextResponse.json({ orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
