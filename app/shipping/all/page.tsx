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
    <div className="flex flex-col gap-6 text-zinc-100">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ QUEUE · 01 · ALL ORDERS
        </p>
        <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
          Tất cả đơn hàng<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Tìm kiếm, xem chi tiết và chỉnh sửa trạng thái mọi đơn.
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
    { label: "PENDING", desc: "Chờ xác nhận", value: counts.pending ?? 0, color: "text-yellow-300" },
    { label: "PREPARING", desc: "Chuẩn bị", value: counts.confirmed ?? 0, color: "text-cyan-300" },
    { label: "TRANSIT", desc: "Đang giao", value: counts.shipping ?? 0, color: "text-purple-300" },
    { label: "DELIVERED", desc: "Hôm nay", value: deliveredToday, color: "text-green-300" },
    { label: "RETURNED", desc: "Hoàn", value: counts.returned ?? 0, color: "text-orange-300" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="relative border-2 border-zinc-800 bg-zinc-900 px-4 py-3"
        >
          <span className="mc-rivet mc-rivet-tl" />
          <span className="mc-rivet mc-rivet-tr" />
          <p className="mc-mono text-[9px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ {c.label}
          </p>
          <p className={`mc-mono mt-1.5 text-[24px] font-black ${c.color}`}>{c.value}</p>
          <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}
