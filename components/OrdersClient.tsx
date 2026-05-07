"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Order } from "@/lib/orders";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "PENDING", color: "border-yellow-500/60 bg-yellow-500/10 text-yellow-300" },
  confirmed: { label: "PREPARING", color: "border-cyan-500/60 bg-cyan-500/10 text-cyan-300" },
  shipping: { label: "IN TRANSIT", color: "border-purple-500/60 bg-purple-500/10 text-purple-300" },
  delivered: { label: "DELIVERED", color: "border-green-500/60 bg-green-500/10 text-green-300" },
  returned: { label: "RETURNED", color: "border-orange-500/60 bg-orange-500/10 text-orange-300" },
  cancelled: { label: "CANCELLED", color: "border-zinc-700 bg-zinc-800 text-zinc-400" },
};

const TABS = [
  { id: "all", label: "ALL", status: null },
  { id: "pending", label: "PENDING", status: "pending" },
  { id: "confirmed", label: "PREP", status: "confirmed" },
  { id: "shipping", label: "TRANSIT", status: "shipping" },
  { id: "delivered", label: "DONE", status: "delivered" },
  { id: "returned", label: "RETURN", status: "returned" },
  { id: "cancelled", label: "CANCEL", status: "cancelled" },
];

export function OrdersClient({ orders }: { orders: Order[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab || tab.status === null) return orders;
    return orders.filter((o) => o.status === tab.status);
  }, [orders, activeTab]);

  return (
    <div className="relative overflow-hidden border-2 border-zinc-700 bg-zinc-900">
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <span className="mc-rivet mc-rivet-bl" />
      <span className="mc-rivet mc-rivet-br" />

      <div className="border-b-2 border-zinc-800 bg-zinc-950">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => {
            const count =
              tab.status === null
                ? orders.length
                : orders.filter((o) => o.status === tab.status).length;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mc-mono relative whitespace-nowrap border-r-2 border-zinc-800 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] transition ${
                  active
                    ? "bg-orange-500/8 text-orange-400"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                ⬢ {tab.label}
                {count > 0 && (
                  <span className={`ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center px-1 text-[10px] font-black ${
                    active ? "bg-orange-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                  }`}>
                    {count}
                  </span>
                )}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-700 bg-zinc-950 p-10 text-center">
            <p className="text-[15px] font-black uppercase tracking-tight text-zinc-100">
              ⬢ {activeTab === "all"
                ? "CHƯA CÓ ĐƠN NÀO"
                : `KHÔNG CÓ ĐƠN ${TABS.find((t) => t.id === activeTab)?.label}`}
            </p>
            {activeTab === "all" && (
              <>
                <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  ▸ Hãy khám phá sản phẩm và đặt hàng ngay.
                </p>
                <Link
                  href="/products"
                  className="mc-btn-primary mc-btn-primary-lg mt-5"
                >
                  ⬢ XEM SẢN PHẨM
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const status = STATUS_LABELS[order.status];
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="relative flex items-center justify-between gap-4 border-2 border-zinc-800 bg-zinc-950 p-4 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-orange-500 hover:shadow-[4px_4px_0_#09090b]"
                >
                  <span className="mc-rivet mc-rivet-tl" />
                  <span className="mc-rivet mc-rivet-tr" />
                  <span className="mc-rivet mc-rivet-bl" />
                  <span className="mc-rivet mc-rivet-br" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="mc-mono text-[12px] font-black uppercase tracking-[0.22em] text-orange-400">
                        ⬢ ORD#{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      {status && (
                        <span
                          className={`mc-mono border-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] ${status.color}`}
                        >
                          {status.label}
                        </span>
                      )}
                    </div>
                    <p className="mc-mono mt-1.5 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      ▸ {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                      AMOUNT
                    </p>
                    <p className="mc-mono mt-0.5 text-[16px] font-black text-orange-400">
                      {formatVnd(order.totalAmount)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
