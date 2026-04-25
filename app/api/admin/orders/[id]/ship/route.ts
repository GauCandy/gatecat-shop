import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { pool } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);

  if (!user || (user.role !== "SHIPPER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const trackingCode = typeof body?.trackingCode === "string" ? body.trackingCode.trim() : "";

    if (!trackingCode) {
      return NextResponse.json(
        { error: "Mã vận chuyển là bắt buộc" },
        { status: 400 }
      );
    }

    const dup = await pool.query(
      `SELECT id FROM orders WHERE tracking_code = $1 AND id <> $2 LIMIT 1`,
      [trackingCode, id]
    );
    if (dup.rows.length) {
      return NextResponse.json(
        { error: "Mã vận chuyển đã được dùng cho đơn khác" },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET status = 'shipping', tracking_code = $2, updated_at = NOW()
      WHERE id = $1 AND status = 'confirmed'
      RETURNING id, status, tracking_code
      `,
      [id, trackingCode]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { error: "Đơn hàng không tồn tại hoặc không ở trạng thái đang chuẩn bị hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: result.rows[0] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
