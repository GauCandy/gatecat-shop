import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { validateVoucherForUser } from "@/lib/vouchers";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const code = typeof body?.code === "string" ? body.code : "";
    const subtotal = Number(body?.subtotal);

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: "Tạm tính không hợp lệ" }, { status: 400 });
    }

    const result = await validateVoucherForUser(user.id, code, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ voucher: result.voucher, discount: result.discount });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
