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
      <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-10 text-center">
        <p className="text-[14px] font-medium text-[var(--color-text)]">
          Không có đơn đang chuẩn bị hàng
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

              {isPickup ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleMarkPickedUp(order.id)}
                  className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  ✓ Khách đã đến lấy hàng
                </button>
              ) : activeId === order.id ? (
                <div className="rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4">
                  <p className="mb-3 text-[13px] font-medium text-[var(--color-text)]">
                    Nhập mã vận chuyển
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="VTP1234567890, GHN123456, ..."
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      autoFocus
                      className="h-10 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    <button
                      type="button"
                      disabled={busy || !trackingCode.trim()}
                      onClick={() => handleShip(order.id)}
                      className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                    >
                      {busy ? "..." : "Chuyển sang đang giao"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setActiveId(null);
                        setTrackingCode("");
                        setError(null);
                      }}
                      className="rounded-lg border border-[var(--color-border)] bg-white px-5 py-2 text-[13px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
                    >
                      Huỷ
                    </button>
                  </div>
                  {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(order.id);
                    setTrackingCode("");
                    setError(null);
                  }}
                  className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110"
                >
                  Đang chuẩn bị hàng → Nhập mã vận chuyển
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
