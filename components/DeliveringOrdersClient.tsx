"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { ShipperOrderRow } from "@/lib/orders";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

type Mode = "delivered" | "returned";

export function DeliveringOrdersClient({
  orders: initial,
}: {
  orders: ShipperOrderRow[];
}) {
  const [orders, setOrders] = useState(initial);
  const [mode, setMode] = useState<Mode>("delivered");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trackingCode = code.trim();
    if (!trackingCode || busy) return;

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode, mode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data?.error ?? "Xử lí thất bại" });
        return;
      }
      const scannedId = data?.order?.id;
      setOrders((list) => list.filter((o) => o.id !== scannedId));
      setMessage({
        type: "ok",
        text:
          mode === "delivered"
            ? `Đã giao: ${data?.order?.recipientName ?? trackingCode}`
            : `Đã hoàn: ${data?.order?.recipientName ?? trackingCode}`,
      });
      setCode("");
    } catch {
      setMessage({ type: "err", text: "Lỗi kết nối" });
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-4">
        <p className="mb-3 text-[13px] font-semibold text-[var(--color-text)]">
          Chế độ quét
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("delivered")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition ${
              mode === "delivered"
                ? "bg-green-600 text-white"
                : "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
            }`}
          >
            ✓ Giao thành công
          </button>
          <button
            type="button"
            onClick={() => setMode("returned")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition ${
              mode === "returned"
                ? "bg-orange-600 text-white"
                : "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
            }`}
          >
            ↩ Hoàn hàng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="mb-2 block text-[13px] font-medium text-[var(--color-text)]">
            Quét / nhập mã vận chuyển
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Đưa máy POS quét vào đây..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={busy}
              className="h-11 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 text-[14px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className={`rounded-lg px-5 py-2 text-[13px] font-semibold text-white transition disabled:opacity-50 ${
                mode === "delivered"
                  ? "bg-green-600 hover:brightness-110"
                  : "bg-orange-600 hover:brightness-110"
              }`}
            >
              {busy ? "..." : mode === "delivered" ? "Giao" : "Hoàn"}
            </button>
          </div>
          {message && (
            <p
              className={`mt-2 text-[12px] ${
                message.type === "ok" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>
      </div>

      <div>
        <p className="mb-3 text-[13px] font-semibold text-[var(--color-text)]">
          Đơn hàng đang giao ({orders.length})
        </p>
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-10 text-center">
            <p className="text-[14px] font-medium text-[var(--color-text)]">
              Không có đơn đang giao
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-[var(--color-border)] bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--color-text)]">
                        Đơn #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      {order.trackingCode && (
                        <span className="rounded bg-[var(--color-surface-2)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-text)]">
                          {order.trackingCode}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
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
                      {[order.addressLine, order.ward, order.district, order.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <Link
                      href={`/shipping/orders/${order.id}`}
                      className="mt-1 inline-block text-[12px] font-medium text-[var(--color-accent)] hover:underline"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                  <p className="whitespace-nowrap text-[13px] font-bold text-[var(--color-text)]">
                    {formatVnd(order.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
