import Link from "next/link";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatNum = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const formatDay = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(d);

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "PENDING", color: "text-yellow-300" },
  confirmed: { label: "PREPARING", color: "text-cyan-300" },
  shipping: { label: "TRANSIT", color: "text-purple-300" },
  delivered: { label: "DELIVERED", color: "text-green-300" },
  returned: { label: "RETURNED", color: "text-orange-300" },
  cancelled: { label: "CANCELLED", color: "text-zinc-400" },
};

type DayRow = { day: string; revenue: string; orders: string };
type StatusRow = { status: string; count: string };
type TopRow = { product_name: string; quantity: string; revenue: string };
type RecentRow = {
  id: string;
  recipient_name: string;
  total_amount: string;
  status: string;
  created_at: Date;
};

export default async function AdminDashboardPage() {
  const [
    totalRes,
    todayRes,
    weekRes,
    statusRes,
    usersRes,
    discountRes,
    voucherActiveRes,
    dailyRes,
    topRes,
    recentRes,
  ] = await Promise.all([
    pool.query<{ revenue: string; orders: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text AS revenue, COUNT(*)::text AS orders
       FROM orders WHERE status = 'delivered'`
    ),
    pool.query<{ revenue: string; orders: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text AS revenue, COUNT(*)::text AS orders
       FROM orders WHERE status = 'delivered' AND updated_at::date = CURRENT_DATE`
    ),
    pool.query<{ revenue: string; orders: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text AS revenue, COUNT(*)::text AS orders
       FROM orders WHERE status = 'delivered' AND updated_at >= NOW() - INTERVAL '7 days'`
    ),
    pool.query<StatusRow>(
      `SELECT status::text AS status, COUNT(*)::text AS count FROM orders GROUP BY status`
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users WHERE role = 'USER'`
    ),
    pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(discount_amount), 0)::text AS total
       FROM orders WHERE status = 'delivered'`
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM vouchers
       WHERE is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)`
    ),
    pool.query<DayRow>(
      `SELECT updated_at::date::text AS day,
              COALESCE(SUM(total_amount), 0)::text AS revenue,
              COUNT(*)::text AS orders
       FROM orders
       WHERE status = 'delivered' AND updated_at >= CURRENT_DATE - INTERVAL '29 days'
       GROUP BY updated_at::date
       ORDER BY day`
    ),
    pool.query<TopRow>(
      `SELECT oi.product_name,
              SUM(oi.quantity)::text AS quantity,
              SUM(oi.subtotal)::text AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'delivered'
       GROUP BY oi.product_name
       ORDER BY SUM(oi.subtotal) DESC
       LIMIT 8`
    ),
    pool.query<RecentRow>(
      `SELECT id, recipient_name, total_amount::text, status::text AS status, created_at
       FROM orders ORDER BY created_at DESC LIMIT 8`
    ),
  ]);

  const totalRevenue = Number(totalRes.rows[0].revenue);
  const totalOrders = Number(totalRes.rows[0].orders);
  const todayRevenue = Number(todayRes.rows[0].revenue);
  const todayOrders = Number(todayRes.rows[0].orders);
  const weekRevenue = Number(weekRes.rows[0].revenue);
  const weekOrders = Number(weekRes.rows[0].orders);
  const totalUsers = Number(usersRes.rows[0].count);
  const totalDiscount = Number(discountRes.rows[0].total);
  const activeVouchers = Number(voucherActiveRes.rows[0].count);

  const statusCounts: Record<string, number> = {};
  for (const row of statusRes.rows) statusCounts[row.status] = Number(row.count);

  const topProducts = topRes.rows.map((r) => ({
    name: r.product_name,
    quantity: Number(r.quantity),
    revenue: Number(r.revenue),
  }));

  const recentOrders = recentRes.rows.map((r) => ({
    id: r.id,
    recipientName: r.recipient_name,
    totalAmount: Number(r.total_amount),
    status: r.status,
    createdAt: r.created_at,
  }));

  const dayMap = new Map<string, { revenue: number; orders: number }>();
  for (const row of dailyRes.rows) {
    dayMap.set(row.day, { revenue: Number(row.revenue), orders: Number(row.orders) });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const series: { date: Date; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const v = dayMap.get(key);
    series.push({ date: d, revenue: v?.revenue ?? 0, orders: v?.orders ?? 0 });
  }
  const maxRevenue = Math.max(1, ...series.map((s) => s.revenue));

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ DASHBOARD · MISSION CONTROL
        </p>
        <h1 className="mt-2 text-[24px] font-black uppercase tracking-tight sm:text-[30px]">
          Tổng quan<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Doanh thu chỉ tính từ đơn đã giao thành công.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="REVENUE · TOTAL" value={formatVnd(totalRevenue)} sub={`${formatNum(totalOrders)} đơn`} />
        <StatCard label="REVENUE · TODAY" value={formatVnd(todayRevenue)} sub={`${formatNum(todayOrders)} đơn`} />
        <StatCard label="REVENUE · 7D" value={formatVnd(weekRevenue)} sub={`${formatNum(weekOrders)} đơn`} />
        <StatCard label="OPERATORS" value={formatNum(totalUsers)} sub={`${activeVouchers} voucher active`} />
      </div>

      <section className="relative border-2 border-zinc-700 bg-zinc-900 p-5">
        <span className="mc-rivet mc-rivet-tl" />
        <span className="mc-rivet mc-rivet-tr" />
        <span className="mc-rivet mc-rivet-bl" />
        <span className="mc-rivet mc-rivet-br" />

        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ REVENUE · LAST 30D
          </p>
          <span className="mc-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            ▸ MAX: <span className="text-orange-400">{formatVnd(maxRevenue)}</span>
          </span>
        </div>
        <div className="mt-4 flex h-44 items-stretch gap-1">
          {series.map((s) => (
            <div
              key={s.date.toISOString()}
              className="group relative flex flex-1 flex-col justify-end"
              title={`${formatDay(s.date)}: ${formatVnd(s.revenue)} (${s.orders} đơn)`}
            >
              <div
                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 transition group-hover:brightness-110"
                style={{
                  height: `${Math.max(2, (s.revenue / maxRevenue) * 100)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mc-mono mt-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          <span>{formatDay(series[0].date)}</span>
          <span>{formatDay(series[Math.floor(series.length / 2)].date)}</span>
          <span>{formatDay(series[series.length - 1].date)}</span>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="relative border-2 border-zinc-700 bg-zinc-900 p-5">
          <span className="mc-rivet mc-rivet-tl" />
          <span className="mc-rivet mc-rivet-tr" />
          <span className="mc-rivet mc-rivet-bl" />
          <span className="mc-rivet mc-rivet-br" />

          <p className="mc-mono border-b-2 border-zinc-800 pb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ ORDER STATUS BREAKDOWN
          </p>
          <div className="mt-3 space-y-2">
            {Object.entries(STATUS_LABELS).map(([key, info]) => {
              const count = statusCounts[key] ?? 0;
              const totalForBar = Math.max(
                1,
                Object.values(statusCounts).reduce((a, b) => a + b, 0)
              );
              return (
                <div key={key}>
                  <div className="mc-mono flex items-center justify-between text-[11px] uppercase tracking-[0.18em]">
                    <span className={`font-black ${info.color}`}>⬢ {info.label}</span>
                    <span className="text-zinc-100">{formatNum(count)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden bg-zinc-950">
                    <div
                      className={`h-full ${info.color.replace("text-", "bg-").replace("-300", "-500")}`}
                      style={{
                        width: `${(count / totalForBar) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mc-mono mt-4 border-t-2 border-zinc-800 pt-3 text-[11px] uppercase tracking-[0.15em] text-zinc-500">
            ▸ Đã giảm voucher:{" "}
            <span className="font-black text-orange-400">{formatVnd(totalDiscount)}</span>
          </div>
        </section>

        <section className="relative border-2 border-zinc-700 bg-zinc-900 p-5">
          <span className="mc-rivet mc-rivet-tl" />
          <span className="mc-rivet mc-rivet-tr" />
          <span className="mc-rivet mc-rivet-bl" />
          <span className="mc-rivet mc-rivet-br" />

          <p className="mc-mono border-b-2 border-zinc-800 pb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ TOP UNITS · BEST SELLERS
          </p>
          {topProducts.length === 0 ? (
            <p className="mc-mono mt-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              ▸ Chưa có dữ liệu.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between gap-3 border-2 border-zinc-800 bg-zinc-950 p-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="mc-mono grid h-7 w-7 shrink-0 place-items-center border-2 border-orange-500/60 bg-orange-500/10 text-[11px] font-black text-orange-400">
                      {i + 1}
                    </span>
                    <p className="line-clamp-1 text-[12px] font-black uppercase tracking-tight text-zinc-100">
                      {p.name}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="mc-mono text-[12px] font-black text-orange-400">
                      {formatVnd(p.revenue)}
                    </p>
                    <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      ▸ {formatNum(p.quantity)} unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="relative border-2 border-zinc-700 bg-zinc-900 p-5">
        <span className="mc-rivet mc-rivet-tl" />
        <span className="mc-rivet mc-rivet-tr" />
        <span className="mc-rivet mc-rivet-bl" />
        <span className="mc-rivet mc-rivet-br" />

        <p className="mc-mono border-b-2 border-zinc-800 pb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ RECENT ORDERS · 8 LATEST
        </p>
        {recentOrders.length === 0 ? (
          <p className="mc-mono mt-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            ▸ Chưa có đơn nào.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full">
              <thead className="mc-mono border-b-2 border-zinc-800 text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">
                <tr>
                  <th className="px-2 py-2 text-left">⬢ ORD#</th>
                  <th className="px-2 py-2 text-left">KHÁCH</th>
                  <th className="px-2 py-2 text-left">STATUS</th>
                  <th className="px-2 py-2 text-right">TỔNG</th>
                  <th className="px-2 py-2 text-right">TIME</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const status = STATUS_LABELS[o.status];
                  return (
                    <tr
                      key={o.id}
                      className="border-b-2 border-zinc-800 last:border-b-0"
                    >
                      <td className="mc-mono px-2 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-orange-400">
                        <Link
                          href={`/shipping/orders/${o.id}`}
                          className="hover:text-orange-300 hover:underline"
                        >
                          ▸ {o.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="mc-mono px-2 py-2 text-[11px] uppercase tracking-[0.08em] text-zinc-100">
                        {o.recipientName}
                      </td>
                      <td className="mc-mono px-2 py-2 text-[10px] font-black uppercase tracking-[0.22em]">
                        {status ? (
                          <span className={status.color}>⬢ {status.label}</span>
                        ) : (
                          o.status
                        )}
                      </td>
                      <td className="mc-mono px-2 py-2 text-right text-[12px] font-black text-orange-400">
                        {formatVnd(o.totalAmount)}
                      </td>
                      <td className="mc-mono px-2 py-2 text-right text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                        {new Intl.DateTimeFormat("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(o.createdAt))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="relative border-2 border-zinc-800 bg-zinc-900 p-4">
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <p className="mc-mono text-[9px] font-black uppercase tracking-[0.32em] text-orange-500">
        ⬢ {label}
      </p>
      <p className="mc-mono mt-2 text-[20px] font-black text-orange-400">{value}</p>
      <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        ▸ {sub}
      </p>
    </div>
  );
}
