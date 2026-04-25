import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { pool } from "@/lib/db";
import { changeOrderStatus } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);

  if (!user || (user.role !== "SHIPPER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const trackingCode = typeof body?.trackingCode === "string" ? body.trackingCode.trim() : "";
    const mode = body?.mode;

    if (!trackingCode) {
      return NextResponse.json({ error: "Thiếu mã vận chuyển" }, { status: 400 });
    }
    if (mode !== "delivered" && mode !== "returned") {
      return NextResponse.json({ error: "Chế độ không hợp lệ" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const found = await client.query<{ id: string; recipient_name: string }>(
        `SELECT id, recipient_name FROM orders
         WHERE tracking_code = $1 AND status = 'shipping' FOR UPDATE`,
        [trackingCode]
      );
      if (!found.rows.length) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Không tìm thấy đơn đang giao với mã này" },
          { status: 404 }
        );
      }

      const orderId = found.rows[0].id;
      const updated = await changeOrderStatus(client, orderId, mode);
      await client.query("COMMIT");

      return NextResponse.json({
        order: {
          ...updated,
          recipientName: found.rows[0].recipient_name,
        },
      });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
