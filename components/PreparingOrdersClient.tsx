"use client";

import Link from "next/link";
import { useState } from "react";
import type { ShipperOrderRow } from "@/lib/orders";
import { toast } from "@/components/Toaster";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));

export function PreparingOrdersClient({ orders: initial }: { orders: ShipperOrderRow[] }) {
  const [orders, setOrders] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleShip = async (orderId: string) => {
    if (!trackingCode.trim()) {
      setError("Vui lòng nhập mã vận chuyển");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode: trackingCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Không chuyển đơn được");
        return;
      }
      setOrders((list) => list.filter((o) => o.id !== orderId));
      setActiveId(null);
      setTrackingCode("");
      toast("Đã chuyển sang đang giao", "success");
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPickedUp = async (orderId: string) => {
    if (!confirm("Xác nhận khách đã nhận hàng tại shop?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data?.error ?? "Không cập nhật được", "error");
        return;
      }
      setOrders((list) => list.filter((o) => o.id !== orderId));
      toast("Đã đánh dấu khách đã nhận hàng", "success");
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="relative border-2 border-dashed border-zinc-700 bg-zinc-900 p-10 text-center">
        <span className="mc-rivet mc-rivet-tl" />
        <span className="mc-rivet mc-rivet-tr" />
        <span className="mc-rivet mc-rivet-bl" />
        <span className="mc-rivet mc-rivet-br" />
        <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
          ⬢ KHÔNG CÓ ĐƠN ĐANG CHUẨN BỊ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isPickup = order.deliveryMethod === "pickup";
        return (
          <div
            key={order.id}
            className="relative border-2 border-zinc-800 bg-zinc-900 p-4"
          >
            <span className="mc-rivet mc-rivet-tl" />
            <span className="mc-rivet mc-rivet-tr" />
            <span className="mc-rivet mc-rivet-bl" />
            <span className="mc-rivet mc-rivet-br" />

            <div className="flex flex-col gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mc-mono text-[12px] font-black uppercase tracking-[0.22em] text-orange-400">
                    ⬢ ORD#{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    ▸ {formatDate(order.createdAt)}
                  </span>
                  <span
                    className={`mc-mono border-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] ${
                      isPickup
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                        : "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                    }`}
                  >
                    {isPickup ? "PICKUP" : "DELIVERY"}
                  </span>
                </div>
                {order.recipientName && (
                  <p className="mt-3 text-[14px] font-black uppercase tracking-tight text-zinc-100">
                    {order.recipientName}
                  </p>
                )}
                {order.phone && (
                  <p className="mc-mono text-[11px] uppercase tracking-[0.15em]">
                    ▸ <a
                      href={`tel:${order.phone}`}
                      className="text-orange-400 underline-offset-2 hover:underline"
                    >
                      {order.phone}
                    </a>
                  </p>
                )}
                {!isPickup && order.addressLine && (
                  <>
                    <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.08em] text-zinc-300">
                      ▸ {order.addressLine}
                    </p>
                    <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {order.ward}, {order.district}, {order.province}
                    </p>
                  </>
                )}
                {isPickup && (
                  <p className="mc-mono mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    ▸ Khách sẽ đến shop lấy trực tiếp.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t-2 border-zinc-800 pt-3">
                  <p className="mc-mono text-[16px] font-black text-orange-400">
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

              {isPickup ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleMarkPickedUp(order.id)}
                  className="mc-mono inline-flex w-full items-center justify-center gap-1 border-2 border-green-500 bg-green-500 px-4 py-3 text-[12px] font-black uppercase tracking-[0.22em] text-zinc-950 shadow-[4px_4px_0_#09090b] transition hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#09090b] disabled:opacity-50"
                >
                  ✓ KHÁCH ĐÃ ĐẾN LẤY
                </button>
              ) : activeId === order.id ? (
                <div className="border-2 border-orange-500 bg-orange-500/8 p-4">
                  <p className="mc-mono mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
                    ⬢ NHẬP TRACKING CODE
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="VTP1234567890, GHN123456..."
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      autoFocus
                      className="mc-mono h-10 flex-1 min-w-[200px] border-2 border-zinc-700 bg-zinc-950 px-3 text-[12px] font-bold uppercase tracking-[0.1em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={busy || !trackingCode.trim()}
                      onClick={() => handleShip(order.id)}
                      className="mc-btn-primary disabled:opacity-50"
                    >
                      ⬢ {busy ? "..." : "SHIP"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setActiveId(null);
                        setTrackingCode("");
                        setError(null);
                      }}
                      className="mc-btn-outline disabled:opacity-50"
                    >
                      ✕ HUỶ
                    </button>
                  </div>
                  {error && (
                    <p className="mc-mono mt-2 text-[11px] font-black uppercase tracking-[0.2em] text-red-400">
                      ⬢ ERR · {error}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(order.id);
                    setTrackingCode("");
                    setError(null);
                  }}
                  className="mc-btn-primary mc-btn-primary-lg w-full justify-center"
                >
                  ⬢ NHẬP TRACKING → SHIP
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
