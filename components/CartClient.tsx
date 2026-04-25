"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/cart";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export function CartClient({ initialItems }: { initialItems: CartItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialItems.map((i) => i.id))
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const subtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.salePrice * it.quantity, 0),
    [selectedItems]
  );
  const listTotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.listPrice * it.quantity, 0),
    [selectedItems]
  );
  const saved = listTotal - subtotal;
  const totalQty = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.quantity, 0),
    [selectedItems]
  );

  const allSelected = selectedIds.size === items.length && items.length > 0;
  const partialSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const showError = (msg: string) => {
    setError(msg);
    window.setTimeout(() => setError(null), 3000);
  };

  const refreshHeader = () => startTransition(() => router.refresh());

  const setQuantity = async (id: string, nextQty: number) => {
    if (busyId) return;
    const prev = items;
    const next =
      nextQty <= 0
        ? items.filter((i) => i.id !== id)
        : items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(nextQty, i.stock) }
              : i
          );
    setItems(next);
    setBusyId(id);
    try {
      const res = await fetch(`/api/cart/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Math.max(0, nextQty) }),
      });
      if (!res.ok) {
        setItems(prev);
        const data = await res.json().catch(() => ({}));
        showError(data?.error ?? "Không cập nhật được");
      } else {
        refreshHeader();
      }
    } catch {
      setItems(prev);
      showError("Lỗi kết nối");
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (id: string) => {
    if (busyId) return;
    const prev = items;
    setItems(items.filter((i) => i.id !== id));
    selectedIds.delete(id);
    setSelectedIds(new Set(selectedIds));
    setBusyId(id);
    try {
      const res = await fetch(`/api/cart/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setItems(prev);
        showError("Không xoá được");
      } else {
        refreshHeader();
      }
    } catch {
      setItems(prev);
      showError("Lỗi kết nối");
    } finally {
      setBusyId(null);
    }
  };

  const goToCheckout = () => {
    if (selectedIds.size === 0) {
      showError("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }
    const ids = Array.from(selectedIds).join(",");
    router.push(`/checkout?items=${ids}`);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-10 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-6 w-6"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <p className="text-[15px] font-medium text-[var(--color-text)]">
          Giỏ hàng trống
        </p>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Khám phá sản phẩm và thêm vào giỏ để xem ở đây.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110"
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = partialSelected;
            }}
            onChange={toggleSelectAll}
            className="h-4 w-4 accent-[var(--color-accent)]"
            aria-label="Chọn tất cả"
          />
          <span className="text-[13px] font-medium text-[var(--color-text)]">
            {selectedIds.size > 0
              ? `Đã chọn ${selectedIds.size} sản phẩm`
              : "Chọn tất cả"}
          </span>
        </div>

        {items.map((it) => {
          const img = it.variantImageUrl ?? it.productImageUrl;
          const lineTotal = it.salePrice * it.quantity;
          const maxed = it.quantity >= it.stock;
          const isBusy = busyId === it.id;
          const isSelected = selectedIds.has(it.id);
          return (
            <div
              key={it.id}
              className={`flex gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4 transition ${
                isSelected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-[var(--color-border)] bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectItem(it.id)}
                className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                aria-label={`Chọn ${it.productName}`}
              />
              <Link
                href={`/products/${it.productSlug}`}
                className="block h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] sm:h-24 sm:w-24"
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={it.productName}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[10px] text-[var(--color-text-dim)]">
                    —
                  </div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  href={`/products/${it.productSlug}`}
                  className="line-clamp-2 text-[14px] font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
                >
                  {it.productName}
                </Link>
                <p className="text-[11px] text-[var(--color-text-dim)]">
                  Mã: <span className="font-medium">{it.sku}</span>
                  {" · "}
                  Còn{" "}
                  <span className="font-medium text-[var(--color-text)]">
                    {it.stock}
                  </span>
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white">
                    <button
                      type="button"
                      aria-label="Giảm"
                      disabled={isBusy || it.quantity <= 1}
                      onClick={() => setQuantity(it.id, it.quantity - 1)}
                      className="grid h-8 w-8 place-items-center text-[var(--color-text-dim)] transition hover:text-[var(--color-text)] disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-[13px] font-medium">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Tăng"
                      disabled={isBusy || maxed}
                      onClick={() => setQuantity(it.id, it.quantity + 1)}
                      className="grid h-8 w-8 place-items-center text-[var(--color-text-dim)] transition hover:text-[var(--color-text)] disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[14px] font-semibold text-[var(--color-text)]">
                        {formatVnd(lineTotal)}
                      </div>
                      {it.listPrice > it.salePrice && (
                        <div className="text-[11px] text-[var(--color-text-dim)] line-through">
                          {formatVnd(it.listPrice * it.quantity)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Xoá"
                      disabled={isBusy}
                      onClick={() => removeItem(it.id)}
                      className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-text-dim)] transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-40"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        className="h-4 w-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {error && (
          <div role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-700">
            {error}
          </div>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-[var(--color-border-strong)] bg-white p-5 lg:sticky lg:top-28">
        <h2 className="text-[14px] font-semibold text-[var(--color-text)]">
          Tóm tắt đơn
        </h2>
        <dl className="mt-4 space-y-2 text-[13px]">
          <div className="flex justify-between text-[var(--color-text-dim)]">
            <dt>Tạm tính ({totalQty} sp)</dt>
            <dd className="text-[var(--color-text)]">{formatVnd(subtotal)}</dd>
          </div>
          {saved > 0 && (
            <div className="flex justify-between text-[var(--color-text-dim)]">
              <dt>Tiết kiệm</dt>
              <dd className="text-green-600">−{formatVnd(saved)}</dd>
            </div>
          )}
          <div className="my-2 h-px bg-[var(--color-border)]" />
          <div className="flex items-baseline justify-between">
            <dt className="text-[var(--color-text-dim)]">Tổng cộng</dt>
            <dd className="text-[20px] font-semibold text-[var(--color-text)]">
              {formatVnd(subtotal)}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          disabled={selectedIds.size === 0}
          onClick={goToCheckout}
          className="mt-5 w-full rounded-lg bg-[var(--color-accent)] px-6 py-3 text-[14px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Thanh toán
        </button>
        <Link
          href="/products"
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-6 py-3 text-[13px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)]"
        >
          Tiếp tục mua sắm
        </Link>
      </aside>
    </div>
  );
}
