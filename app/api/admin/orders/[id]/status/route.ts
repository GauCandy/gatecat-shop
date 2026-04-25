import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { pool } from "@/lib/db";
import { changeOrderStatus } from "@/lib/orders";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
  "returned",
  "cancelled",
] as const;
type Status = (typeof VALID_STATUSES)[number];

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
    const status = body?.status as Status | undefined;
    const rawTracking = body?.trackingCode;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    let trackingUpdate: string | null | undefined;
    if (rawTracking === null || rawTracking === "") {
      trackingUpdate = null;
    } else if (typeof rawTracking === "string") {
      trackingUpdate = rawTracking.trim() || null;
    } else {
      trackingUpdate = undefined;
    }

    const existing = await pool.query<{
      tracking_code: string | null;
      delivery_method: string;
    }>(
      `SELECT tracking_code, delivery_method::text AS delivery_method FROM orders WHERE id = $1`,
      [id]
    );
    if (!existing.rows.length) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    const isPickup = existing.rows[0].delivery_method === "pickup";

    if (status === "shipping" && isPickup) {
      return NextResponse.json(
        { error: "Đơn lấy tại shop không có trạng thái đang giao" },
        { status: 400 }
      );
    }

    if (
      !isPickup &&
      (status === "shipping" || status === "delivered") &&
      trackingUpdate === null
    ) {
      if (!existing.rows[0].tracking_code) {
        return NextResponse.json(
          { error: "Trạng thái này cần có mã vận chuyển" },
          { status: 400 }
        );
      }
    }

    if (trackingUpdate) {
      const dup = await pool.query(
        `SELECT id FROM orders WHERE tracking_code = $1 AND id <> $2 LIMIT 1`,
        [trackingUpdate, id]
      );
      if (dup.rows.length) {
        return NextResponse.json(
          { error: "Mã vận chuyển đã được dùng cho đơn khác" },
          { status: 409 }
        );
      }
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const updated = await changeOrderStatus(client, id, status, {
        trackingCode: trackingUpdate,
      });
      if (!updated) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
      }
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
