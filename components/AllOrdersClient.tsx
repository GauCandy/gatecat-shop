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
  pending: "border-yellow-500/60 bg-yellow-500/10 text-yellow-300",
  confirmed: "border-cyan-500/60 bg-cyan-500/10 text-cyan-300",
  shipping: "border-purple-500/60 bg-purple-500/10 text-purple-300",
  delivered: "border-green-500/60 bg-green-500/10 text-green-300",
  returned: "border-orange-500/60 bg-orange-500/10 text-orange-300",
  cancelled: "border-zinc-700 bg-zinc-800 text-zinc-400",
};

const FILTERS = [
  { id: "all", label: "ALL", value: null },
  ...STATUS_OPTIONS.map((s) => ({ id: s.value, label: s.value.toUpperCase(), value: s.value })),
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
        <div className="relative flex-1 md:max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="QUERY · MÃ ĐƠN, SĐT, TÊN, TRACKING..."
            className="mc-mono h-10 w-full border-2 border-zinc-700 bg-zinc-900 px-3 pr-9 text-[12px] font-bold uppercase tracking-[0.1em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xoá tìm kiếm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-400"
            >
              ✕
            </button>
          )}
        </div>
        <span className="mc-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          ▸ {filtered.length} / {orders.length} ORDER
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
              className={`mc-mono inline-flex items-center gap-2 border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] transition ${
                active
                  ? "border-orange-500 bg-orange-500 text-zinc-950 shadow-[2px_2px_0_#09090b]"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100"
              }`}
            >
              ⬢ {f.label}
              <span
                className={`px-1.5 py-0.5 text-[9px] ${
                  active ? "bg-zinc-950 text-orange-400" : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="relative border-2 border-dashed border-zinc-700 bg-zinc-900 p-10 text-center">
          <span className="mc-rivet mc-rivet-tl" />
          <span className="mc-rivet mc-rivet-tr" />
          <span className="mc-rivet mc-rivet-bl" />
          <span className="mc-rivet mc-rivet-br" />
          <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
            ⬢ KHÔNG CÓ ĐƠN NÀO
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const r = getRow(order);
            const dirty = isDirty(order);
            return (
              <div
                key={order.id}
                className="relative border-2 border-zinc-800 bg-zinc-900 p-3"
              >
                <span className="mc-rivet mc-rivet-tl" />
                <span className="mc-rivet mc-rivet-tr" />
                <span className="mc-rivet mc-rivet-bl" />
                <span className="mc-rivet mc-rivet-br" />

                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mc-mono text-[12px] font-black uppercase tracking-[0.22em] text-orange-400">
                        ⬢ ORD#{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`mc-mono border-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] ${
                          STATUS_BADGE[order.status] ?? "border-zinc-700 bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ??
                          order.status}
                      </span>
                      <span className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        ▸ {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.15em] text-zinc-300">
                      ▸ {order.recipientName ?? "—"}
                      {order.phone && (
                        <>
                          {" · "}
                          <a
                            href={`tel:${order.phone}`}
                            className="text-orange-400 underline-offset-2 hover:underline"
                          >
                            {order.phone}
                          </a>
                        </>
                      )}
                    </p>
                    <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {order.deliveryMethod === "pickup"
                        ? "🏪 LẤY TẠI SHOP"
                        : [order.addressLine, order.ward, order.district, order.province]
                            .filter(Boolean)
                            .join(", ")}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <p className="mc-mono text-[14px] font-black text-orange-400">
                        {formatVnd(order.totalAmount)}
                      </p>
                      <Link
                        href={`/shipping/orders/${order.id}`}
                        className="mc-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-400 hover:text-orange-300"
                      >
                        ▸ XEM CHI TIẾT →
                      </Link>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 md:w-[360px]">
                    <div className="flex gap-2">
                      <select
                        value={r.status}
                        onChange={(e) => setRow(order.id, { status: e.target.value, error: null })}
                        disabled={r.saving}
                        className="mc-mono h-9 flex-1 border-2 border-zinc-700 bg-zinc-950 px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-100 focus:border-orange-500 focus:outline-none"
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
                      placeholder="TRACKING CODE (TUỲ CHỌN)"
                      value={r.trackingCode}
                      onChange={(e) =>
                        setRow(order.id, { trackingCode: e.target.value, error: null })
                      }
                      disabled={r.saving}
                      className="mc-mono h-9 border-2 border-zinc-700 bg-zinc-950 px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={!dirty || r.saving}
                      onClick={() => handleSave(order)}
                      className="mc-btn-primary w-full justify-center disabled:opacity-50"
                    >
                      ⬢ {r.saving ? "ĐANG LƯU..." : dirty ? "LƯU THAY ĐỔI" : "KHÔNG ĐỔI"}
                    </button>
                    {r.error && (
                      <p className="mc-mono text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                        ⬢ ERR · {r.error}
                      </p>
                    )}
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
