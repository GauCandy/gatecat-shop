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
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đang chuẩn bị hàng", color: "bg-blue-100 text-blue-700" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  returned: { label: "Hoàn hàng", color: "bg-orange-100 text-orange-700" },
  cancelled: { label: "Đã huỷ", color: "bg-gray-200 text-gray-700" },
};

const TABS = [
  { id: "all", label: "Tất cả", status: null },
  { id: "pending", label: "Chờ xác nhận", status: "pending" },
  { id: "confirmed", label: "Đang chuẩn bị", status: "confirmed" },
  { id: "shipping", label: "Đang giao", status: "shipping" },
  { id: "delivered", label: "Đã giao", status: "delivered" },
  { id: "returned", label: "Hoàn hàng", status: "returned" },
  { id: "cancelled", label: "Đã huỷ", status: "cancelled" },
];

export function OrdersClient({ orders }: { orders: Order[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab || tab.status === null) return orders;
    return orders.filter((o) => o.status === tab.status);
  }, [orders, activeTab]);

  return (
    <div className="rounded-xl border border-[var(--color-border-strong)] bg-white overflow-hidden">
      <div className="border-b border-[var(--color-border)]">
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
                className={`relative whitespace-nowrap px-5 py-4 text-[14px] font-medium transition ${
                  active
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[11px] font-semibold text-[var(--color-text)]">
                    {count}
                  </span>
                )}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-accent)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-10 text-center">
            <p className="text-[14px] font-medium text-[var(--color-text)]">
              {activeTab === "all"
                ? "Bạn chưa có đơn hàng nào"
                : `Không có đơn hàng ${TABS.find((t) => t.id === activeTab)?.label?.toLowerCase()}`}
            </p>
            {activeTab === "all" && (
              <>
                <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
                  Hãy khám phá sản phẩm và đặt hàng ngay.
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-flex rounded-lg bg-[var(--color-accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110"
                >
                  Xem sản phẩm
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
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] p-4 transition hover:shadow-sm hover:border-[var(--color-accent)]/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-semibold text-[var(--color-text)]">
                        Đơn #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      {status && (
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[var(--color-text)]">
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
