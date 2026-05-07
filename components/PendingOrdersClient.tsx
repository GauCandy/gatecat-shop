"use client";

import Link from "next/link";
import { useState } from "react";
import type { ShipperOrderRow } from "@/lib/orders";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));

export function PendingOrdersClient({ orders: initial }: { orders: ShipperOrderRow[] }) {
  const [orders, setOrders] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (orderId: string) => {
    setBusyId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm`, {
        method: "PATCH",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Không xác nhận được");
        return;
      }
      setOrders((list) => list.filter((o) => o.id !== orderId));
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusyId(null);
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
          ⬢ KHÔNG CÓ ĐƠN CHỜ XÁC NHẬN
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="mc-mono border-2 border-red-500/60 bg-red-500/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-red-300">
          ⬢ ERR · {error}
        </div>
      )}
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

              <button
                type="button"
                disabled={busyId === order.id}
                onClick={() => handleConfirm(order.id)}
                className="mc-btn-primary mc-btn-primary-lg w-full justify-center disabled:opacity-50"
              >
                ⬢ {busyId === order.id ? "..." : "XÁC NHẬN ĐƠN"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
