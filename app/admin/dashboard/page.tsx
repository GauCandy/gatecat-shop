import Link from "next/link";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatNum = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const formatDay = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(d);

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "text-yellow-700" },
  confirmed: { label: "Đang chuẩn bị", color: "text-blue-700" },
  shipping: { label: "Đang giao", color: "text-purple-700" },
  delivered: { label: "Đã giao", color: "text-green-700" },
  returned: { label: "Hoàn hàng", color: "text-orange-700" },
  cancelled: { label: "Đã huỷ", color: "text-gray-700" },
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

  // Build last-30-days series filling missing days with 0
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
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Tổng quan</h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Doanh thu, số đơn và sản phẩm bán chạy. Doanh thu chỉ tính từ đơn đã giao thành công.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Doanh thu (tất cả)"
          value={formatVnd(totalRevenue)}
          sub={`${formatNum(totalOrders)} đơn đã giao`}
          accent="text-green-700"
        />
        <StatCard
          label="Doanh thu hôm nay"
          value={formatVnd(todayRevenue)}
          sub={`${formatNum(todayOrders)} đơn`}
          accent="text-blue-700"
        />
        <StatCard
          label="Doanh thu 7 ngày"
          value={formatVnd(weekRevenue)}
          sub={`${formatNum(weekOrders)} đơn`}
          accent="text-purple-700"
        />
        <StatCard
          label="Khách hàng"
          value={formatNum(totalUsers)}
          sub={`${activeVouchers} voucher đang hoạt động`}
          accent="text-orange-700"
        />
      </div>

      <section className="rounded-xl border border-[var(--color-border-strong)] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-[var(--color-text)]">
            Doanh thu 30 ngày gần nhất
          </h2>
          <span className="text-[12px] text-[var(--color-text-dim)]">
            Cao nhất: {formatVnd(maxRevenue)}
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
                className="w-full rounded-t bg-gradient-to-t from-[var(--color-accent)] to-[var(--color-accent)]/70 transition group-hover:brightness-110"
                style={{
                  height: `${Math.max(2, (s.revenue / maxRevenue) * 100)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-[var(--color-text-dim)]">
          <span>{formatDay(series[0].date)}</span>
          <span>{formatDay(series[Math.floor(series.length / 2)].date)}</span>
          <span>{formatDay(series[series.length - 1].date)}</span>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border border-[var(--color-border-strong)] bg-white p-5">
          <h2 className="text-[14px] font-bold text-[var(--color-text)]">
            Trạng thái đơn hàng
          </h2>
          <div className="mt-3 space-y-2">
            {Object.entries(STATUS_LABELS).map(([key, info]) => {
              const count = statusCounts[key] ?? 0;
              const totalForBar = Math.max(
                1,
                Object.values(statusCounts).reduce((a, b) => a + b, 0)
              );
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className={`font-medium ${info.color}`}>{info.label}</span>
                    <span className="text-[var(--color-text)]">{formatNum(count)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                    <div
                      className="h-full bg-current opacity-60"
                      style={{
                        width: `${(count / totalForBar) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-[var(--color-border)] pt-3 text-[12px] text-[var(--color-text-dim)]">
            Đã giảm giá qua voucher:{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {formatVnd(totalDiscount)}
            </span>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-border-strong)] bg-white p-5">
          <h2 className="text-[14px] font-bold text-[var(--color-text)]">
            Sản phẩm bán chạy
          </h2>
          {topProducts.length === 0 ? (
            <p className="mt-3 text-[13px] text-[var(--color-text-dim)]">
              Chưa có dữ liệu — chưa có đơn nào hoàn tất.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] p-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-surface-2)] text-[11px] font-bold text-[var(--color-text)]">
                      {i + 1}
                    </span>
                    <p className="line-clamp-1 text-[13px] text-[var(--color-text)]">
                      {p.name}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[13px] font-semibold text-[var(--color-text)]">
                      {formatVnd(p.revenue)}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-dim)]">
                      Đã bán {formatNum(p.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-[var(--color-border-strong)] bg-white p-5">
        <h2 className="text-[14px] font-bold text-[var(--color-text)]">
          Đơn hàng mới nhất
        </h2>
        {recentOrders.length === 0 ? (
          <p className="mt-3 text-[13px] text-[var(--color-text-dim)]">Chưa có đơn nào.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-[13px]">
              <thead className="border-b border-[var(--color-border)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
                <tr>
                  <th className="px-2 py-2 text-left">Mã đơn</th>
                  <th className="px-2 py-2 text-left">Khách</th>
                  <th className="px-2 py-2 text-left">Trạng thái</th>
                  <th className="px-2 py-2 text-right">Tổng</th>
                  <th className="px-2 py-2 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const status = STATUS_LABELS[o.status];
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-[var(--color-border)] last:border-b-0"
                    >
                      <td className="px-2 py-2 font-mono text-[12px] text-[var(--color-text)]">
                        <Link
                          href={`/shipping/orders/${o.id}`}
                          className="hover:text-[var(--color-accent)] hover:underline"
                        >
                          #{o.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-2 py-2 text-[var(--color-text)]">
                        {o.recipientName}
                      </td>
                      <td className="px-2 py-2">
                        {status ? (
                          <span className={`text-[12px] font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        ) : (
                          o.status
                        )}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-[var(--color-text)]">
                        {formatVnd(o.totalAmount)}
                      </td>
                      <td className="px-2 py-2 text-right text-[12px] text-[var(--color-text-dim)]">
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
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
        {label}
      </p>
      <p className={`mt-1 text-[22px] font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">{sub}</p>
    </div>
  );
}
