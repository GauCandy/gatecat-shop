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
      <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-10 text-center">
        <p className="text-[14px] font-medium text-[var(--color-text)]">
          Không có đơn hàng chờ xác nhận
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      )}
      {orders.map((order) => {
        const isPickup = order.deliveryMethod === "pickup";
        return (
        <div
          key={order.id}
          className="rounded-lg border border-[var(--color-border)] bg-white p-4"
        >
          <div className="flex flex-col gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--color-text)]">
                  Đơn #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[11px] text-[var(--color-text-dim)]">
                  {formatDate(order.createdAt)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isPickup
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {isPickup ? "Lấy tại shop" : "Giao hàng"}
                </span>
              </div>
              {order.recipientName && (
                <p className="mt-2 text-[13px] font-medium text-[var(--color-text)]">
                  {order.recipientName}
                </p>
              )}
              {order.phone && (
                <p className="text-[12px]">
                  <a
                    href={`tel:${order.phone}`}
                    className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                  >
                    {order.phone}
                  </a>
                </p>
              )}
              {!isPickup && order.addressLine && (
                <>
                  <p className="mt-1 text-[13px] text-[var(--color-text)]">
                    {order.addressLine}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-dim)]">
                    {order.ward}, {order.district}, {order.province}
                  </p>
                </>
              )}
              {isPickup && (
                <p className="mt-1 text-[12px] italic text-[var(--color-text-dim)]">
                  Khách sẽ đến shop lấy trực tiếp.
                </p>
              )}
              <div className="mt-2 flex items-center gap-3">
                <p className="text-[14px] font-bold text-[var(--color-text)]">
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

            <button
              type="button"
              disabled={busyId === order.id}
              onClick={() => handleConfirm(order.id)}
              className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {busyId === order.id ? "..." : "✓ Xác nhận đơn hàng"}
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}
