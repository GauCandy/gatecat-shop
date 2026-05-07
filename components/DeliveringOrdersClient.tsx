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
      <div className="relative border-2 border-orange-500/60 bg-zinc-900 p-5 shadow-[6px_6px_0_#09090b]">
        <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

        <p className="mc-mono mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ SCAN MODE
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("delivered")}
            className={`mc-mono flex-1 border-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] transition ${
              mode === "delivered"
                ? "border-green-500 bg-green-500 text-zinc-950 shadow-[3px_3px_0_#09090b]"
                : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100"
            }`}
          >
            ✓ GIAO THÀNH CÔNG
          </button>
          <button
            type="button"
            onClick={() => setMode("returned")}
            className={`mc-mono flex-1 border-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] transition ${
              mode === "returned"
                ? "border-orange-500 bg-orange-500 text-zinc-950 shadow-[3px_3px_0_#09090b]"
                : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100"
            }`}
          >
            ↩ HOÀN HÀNG
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 border-t-2 border-zinc-800 pt-4">
          <label className="mc-mono mb-2 block text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ QUÉT / NHẬP TRACKING CODE
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Đưa máy POS quét vào đây..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={busy}
              className="mc-mono h-11 flex-1 border-2 border-zinc-700 bg-zinc-950 px-3 text-[14px] font-bold uppercase tracking-[0.08em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className={`mc-mono inline-flex items-center justify-center gap-1 border-2 px-5 py-2 text-[11px] font-black uppercase tracking-[0.22em] shadow-[3px_3px_0_#09090b] transition disabled:opacity-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#09090b] ${
                mode === "delivered"
                  ? "border-green-500 bg-green-500 text-zinc-950"
                  : "border-orange-500 bg-orange-500 text-zinc-950"
              }`}
            >
              {busy ? "..." : mode === "delivered" ? "✓ GIAO" : "↩ HOÀN"}
            </button>
          </div>
          {message && (
            <p
              className={`mc-mono mt-2 border-2 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${
                message.type === "ok"
                  ? "border-green-500/60 bg-green-500/10 text-green-300"
                  : "border-red-500/60 bg-red-500/10 text-red-300"
              }`}
            >
              ⬢ {message.text}
            </p>
          )}
        </form>
      </div>

      <div>
        <p className="mc-mono mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ ĐANG GIAO ({orders.length})
        </p>
        {orders.length === 0 ? (
          <div className="relative border-2 border-dashed border-zinc-700 bg-zinc-900 p-10 text-center">
            <span className="mc-rivet mc-rivet-tl" />
            <span className="mc-rivet mc-rivet-tr" />
            <span className="mc-rivet mc-rivet-bl" />
            <span className="mc-rivet mc-rivet-br" />
            <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
              ⬢ KHÔNG CÓ ĐƠN ĐANG GIAO
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="relative border-2 border-zinc-800 bg-zinc-900 p-3"
              >
                <span className="mc-rivet mc-rivet-tl" />
                <span className="mc-rivet mc-rivet-tr" />
                <span className="mc-rivet mc-rivet-bl" />
                <span className="mc-rivet mc-rivet-br" />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mc-mono text-[12px] font-black uppercase tracking-[0.22em] text-orange-400">
                        ⬢ ORD#{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      {order.trackingCode && (
                        <span className="mc-mono border-2 border-zinc-700 bg-zinc-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                          {order.trackingCode}
                        </span>
                      )}
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
                      {[order.addressLine, order.ward, order.district, order.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <Link
                      href={`/shipping/orders/${order.id}`}
                      className="mc-mono mt-1 inline-block text-[10px] font-black uppercase tracking-[0.22em] text-orange-400 hover:text-orange-300"
                    >
                      ▸ XEM CHI TIẾT →
                    </Link>
                  </div>
                  <p className="mc-mono whitespace-nowrap text-[14px] font-black text-orange-400">
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
