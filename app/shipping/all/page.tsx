import { pool } from "@/lib/db";
import type { ShipperOrderRow } from "@/lib/orders";
import { AllOrdersClient } from "@/components/AllOrdersClient";

export const dynamic = "force-dynamic";

type StatsRow = { status: string; count: string };

export default async function ShippingAllPage() {
  const [ordersResult, statsResult, todayResult] = await Promise.all([
    pool.query<ShipperOrderRow>(
      `
      SELECT
        id,
        user_id as "userId",
        recipient_name as "recipientName",
        phone,
        address_line as "addressLine",
        province,
        district,
        ward,
        total_amount as "totalAmount",
        status,
        delivery_method::text as "deliveryMethod",
        tracking_code as "trackingCode",
        created_at as "createdAt"
      FROM orders
      ORDER BY created_at DESC
      `
    ),
    pool.query<StatsRow>(
      `SELECT status::text AS status, COUNT(*)::text AS count FROM orders GROUP BY status`
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM orders
       WHERE status = 'delivered' AND updated_at::date = CURRENT_DATE`
    ),
  ]);

  const counts: Record<string, number> = {};
  for (const row of statsResult.rows) counts[row.status] = Number(row.count);
  const deliveredToday = Number(todayResult.rows[0]?.count ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Tất cả đơn hàng</h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Tìm kiếm, xem chi tiết và chỉnh sửa trạng thái mọi đơn hàng.
        </p>
      </div>

      <StatsRow counts={counts} deliveredToday={deliveredToday} />

      <AllOrdersClient orders={ordersResult.rows} />
    </div>
  );
}

function StatsRow({
  counts,
  deliveredToday,
}: {
  counts: Record<string, number>;
  deliveredToday: number;
}) {
  const cards = [
    { label: "Chờ xác nhận", value: counts.pending ?? 0, color: "text-yellow-700" },
    { label: "Đang chuẩn bị", value: counts.confirmed ?? 0, color: "text-blue-700" },
    { label: "Đang giao", value: counts.shipping ?? 0, color: "text-purple-700" },
    { label: "Đã giao hôm nay", value: deliveredToday, color: "text-green-700" },
    { label: "Hoàn hàng", value: counts.returned ?? 0, color: "text-orange-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3"
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
            {c.label}
          </p>
          <p className={`mt-1 text-[22px] font-bold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
