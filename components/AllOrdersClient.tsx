"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ShipperOrderRow } from "@/lib/orders";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đang chuẩn bị hàng" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "returned", label: "Hoàn hàng" },
  { value: "cancelled", label: "Đã huỷ" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipping: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  returned: "bg-orange-100 text-orange-700",
  cancelled: "bg-gray-200 text-gray-700",
};

const FILTERS = [
  { id: "all", label: "Tất cả", value: null },
  ...STATUS_OPTIONS.map((s) => ({ id: s.value, label: s.label, value: s.value })),
];

type RowState = {
  status: string;
  trackingCode: string;
  saving: boolean;
  error: string | null;
};

export function AllOrdersClient({ orders: initial }: { orders: ShipperOrderRow[] }) {
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.recipientName ?? "").toLowerCase().includes(q) ||
        (o.phone ?? "").toLowerCase().includes(q) ||
        (o.trackingCode ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  const getRow = (o: ShipperOrderRow): RowState =>
    rowState[o.id] ?? {
      status: o.status,
      trackingCode: o.trackingCode ?? "",
      saving: false,
      error: null,
    };

  const setRow = (id: string, patch: Partial<RowState>) => {
    setRowState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? getRow(orders.find((o) => o.id === id)!)), ...patch },
    }));
  };

  const isDirty = (o: ShipperOrderRow) => {
    const r = getRow(o);
    return r.status !== o.status || r.trackingCode !== (o.trackingCode ?? "");
  };

  const handleSave = async (o: ShipperOrderRow) => {
    const r = getRow(o);
    setRow(o.id, { saving: true, error: null });
    try {
      const res = await fetch(`/api/admin/orders/${o.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: r.status,
          trackingCode: r.trackingCode.trim() === "" ? null : r.trackingCode.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRow(o.id, { saving: false, error: data?.error ?? "Lưu thất bại" });
        return;
      }
      setOrders((list) =>
        list.map((it) =>
          it.id === o.id
            ? { ...it, status: data.order.status, trackingCode: data.order.trackingCode }
            : it
        )
      );
      setRowState((prev) => {
        const next = { ...prev };
        delete next[o.id];
        return next;
      });
    } catch {
      setRow(o.id, { saving: false, error: "Lỗi kết nối" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, SĐT, tên, mã vận chuyển..."
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 pr-9 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xoá tìm kiếm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            >
              ✕
            </button>
          )}
        </div>
        <span className="text-[12px] text-[var(--color-text-dim)]">
          {filtered.length} / {orders.length} đơn
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count =
            f.value === null ? orders.length : orders.filter((o) => o.status === f.value).length;
          const active = filter === f.value;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                active
                  ? "bg-[var(--color-text)] text-white"
                  : "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {f.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                  active ? "bg-white/20" : "bg-[var(--color-surface-2)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-10 text-center">
          <p className="text-[14px] font-medium text-[var(--color-text)]">Không có đơn nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const r = getRow(order);
            const dirty = isDirty(order);
            return (
              <div
                key={order.id}
                className="rounded-lg border border-[var(--color-border)] bg-white p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--color-text)]">
                        Đơn #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ??
                          order.status}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-dim)]">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--color-text)]">
                      {order.recipientName ?? "—"}
                      {order.phone && (
                        <>
                          {" · "}
                          <a
                            href={`tel:${order.phone}`}
                            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                          >
                            {order.phone}
                          </a>
                        </>
                      )}
                    </p>
                    <p className="text-[12px] text-[var(--color-text-dim)]">
                      {order.deliveryMethod === "pickup"
                        ? "🏪 Lấy tại shop"
                        : [order.addressLine, order.ward, order.district, order.province]
                            .filter(Boolean)
                            .join(", ")}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <p className="text-[13px] font-bold text-[var(--color-text)]">
                        {formatVnd(order.totalAmount)}
                      </p>
                      <Link
                        href={`/shipping/orders/${order.id}`}
                        className="text-[12px] font-medium text-[var(--color-accent)] hover:underline"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 md:w-[360px]">
                    <div className="flex gap-2">
                      <select
                        value={r.status}
                        onChange={(e) => setRow(order.id, { status: e.target.value, error: null })}
                        disabled={r.saving}
                        className="h-9 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-2 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Mã vận chuyển (tuỳ chọn)"
                      value={r.trackingCode}
                      onChange={(e) =>
                        setRow(order.id, { trackingCode: e.target.value, error: null })
                      }
                      disabled={r.saving}
                      className="h-9 rounded-lg border border-[var(--color-border)] bg-white px-2 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    <button
                      type="button"
                      disabled={!dirty || r.saving}
                      onClick={() => handleSave(order)}
                      className="h-9 rounded-lg bg-[var(--color-accent)] px-4 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                    >
                      {r.saving ? "Đang lưu..." : dirty ? "Lưu thay đổi" : "Chưa thay đổi"}
                    </button>
                    {r.error && <p className="text-[12px] text-red-600">{r.error}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
