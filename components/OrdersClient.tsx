"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Order, OrderItem } from "@/lib/orders";

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

function ItemThumb({ item }: { item: OrderItem }) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-zinc-700 bg-zinc-900">
      {item.variantImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.variantImageUrl}
          alt={item.productName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-[9px] font-black text-zinc-600">
          IMG
        </span>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const items = order.items ?? [];
  const firstItem = items[0] ?? null;
  const extraCount = items.length - 1;
  const status = STATUS_LABELS[order.status];

  return (
    <div className="relative border-2 border-zinc-800 bg-zinc-950 transition hover:border-orange-500/60">
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <span className="mc-rivet mc-rivet-bl" />
      <span className="mc-rivet mc-rivet-br" />

      {/* Main row — clickable link */}
      <Link
        href={`/orders/${order.id}`}
        className="flex items-center gap-3 p-4 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#09090b] transition"
      >
        {/* Thumbnail */}
        {firstItem && <ItemThumb item={firstItem} />}
        {!firstItem && (
          <div className="h-12 w-12 shrink-0 border border-zinc-700 bg-zinc-900" />
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          {firstItem && (
            <p className="truncate text-[13px] font-semibold text-zinc-100">
              {firstItem.productName}
              {extraCount > 0 && (
                <span className="ml-2 text-[12px] text-zinc-500">
                  +{extraCount} sp
                </span>
              )}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="mc-mono text-[11px] font-black uppercase tracking-[0.18em] text-orange-400">
              ⬢ ORD#{order.id.slice(0, 8).toUpperCase()}
            </span>
            {status && (
              <span
                className={`mc-mono border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] ${status.color}`}
              >
                {status.label}
              </span>
            )}
          </div>
          <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            ▸ {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Amount */}
        <div className="shrink-0 text-right">
          <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            AMOUNT
          </p>
          <p className="mc-mono mt-0.5 text-[15px] font-black text-orange-400">
            {formatVnd(order.totalAmount)}
          </p>
        </div>
      </Link>

      {/* Expand button — only if 2+ items */}
      {extraCount > 0 && (
        <>
          <div className="border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mc-mono flex w-full items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={`h-3 w-3 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {expanded ? "Ẩn bớt" : `Xem thêm ${extraCount} sản phẩm`}
            </button>
          </div>

          {expanded && (
            <div className="border-t border-zinc-800 px-4 pb-3 pt-2">
              <ul className="flex flex-col gap-2">
                {items.slice(1).map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <ItemThumb item={item} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-zinc-300">
                        {item.productName}
                      </p>
                      <p className="mc-mono text-[10px] text-zinc-500">
                        {item.variantSku} · x{item.quantity}
                      </p>
                    </div>
                    <p className="mc-mono shrink-0 text-[12px] font-bold text-zinc-300">
                      {formatVnd(item.subtotal)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
                <Link href="/products" className="mc-btn-primary mc-btn-primary-lg mt-5">
                  ⬢ XEM SẢN PHẨM
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
