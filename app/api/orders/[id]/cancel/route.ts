import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { pool } from "@/lib/db";
import { changeOrderStatus } from "@/lib/orders";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const cur = await client.query<{ status: string; user_id: string }>(
        `SELECT status::text AS status, user_id
         FROM orders WHERE id = $1 FOR UPDATE`,
        [id]
      );
      if (!cur.rows.length) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });
      }
      if (cur.rows[0].user_id !== user.id) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
      }
      if (cur.rows[0].status !== "pending") {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Chỉ huỷ được đơn đang chờ xác nhận" },
          { status: 400 }
        );
      }

      const updated = await changeOrderStatus(client, id, "cancelled");
      await client.query("COMMIT");
      return NextResponse.json({ order: updated });
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
