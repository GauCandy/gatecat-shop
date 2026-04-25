import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { pool } from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);

  if (!user || (user.role !== "SHIPPER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const result = await pool.query(
      `
      UPDATE orders
      SET status = 'confirmed', updated_at = NOW()
      WHERE id = $1 AND status = 'pending'
      RETURNING id, status
      `,
      [id]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { error: "Đơn hàng không tồn tại hoặc không ở trạng thái chờ xác nhận" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: result.rows[0] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
