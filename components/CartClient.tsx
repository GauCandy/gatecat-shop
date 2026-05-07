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
      <div className="relative border-2 border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">
        <span className="mc-rivet mc-rivet-tl" />
        <span className="mc-rivet mc-rivet-tr" />
        <span className="mc-rivet mc-rivet-bl" />
        <span className="mc-rivet mc-rivet-br" />
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center border-2 border-zinc-700 bg-zinc-950 text-orange-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-7 w-7"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <p className="text-[16px] font-black uppercase tracking-tight text-zinc-100">
          ⬢ CARGO BAY EMPTY
        </p>
        <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Chưa có unit nào trong giỏ. Khám phá sản phẩm để bắt đầu.
        </p>
        <Link href="/products" className="mc-btn-primary mc-btn-primary-lg mt-6">
          ⬢ XEM SẢN PHẨM
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 border-2 border-zinc-700 bg-zinc-900 p-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = partialSelected;
            }}
            onChange={toggleSelectAll}
            className="h-4 w-4 accent-orange-500"
            aria-label="Chọn tất cả"
          />
          <span className="mc-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-100">
            {selectedIds.size > 0
              ? `▸ ĐÃ CHỌN ${selectedIds.size} UNIT`
              : "⬢ CHỌN TẤT CẢ"}
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
              className={`relative flex gap-3 border-2 p-3 sm:gap-4 sm:p-4 transition ${
                isSelected
                  ? "border-orange-500 bg-orange-500/5"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <span className="mc-rivet mc-rivet-tl" />
              <span className="mc-rivet mc-rivet-tr" />
              <span className="mc-rivet mc-rivet-bl" />
              <span className="mc-rivet mc-rivet-br" />

              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectItem(it.id)}
                className="mt-1 h-4 w-4 accent-orange-500"
                aria-label={`Chọn ${it.productName}`}
              />
              <Link
                href={`/products/${it.productSlug}`}
                className="block h-20 w-20 shrink-0 overflow-hidden border-2 border-zinc-800 bg-zinc-950 sm:h-24 sm:w-24"
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
                  <div className="grid h-full w-full place-items-center text-[10px] text-zinc-600">
                    —
                  </div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  href={`/products/${it.productSlug}`}
                  className="line-clamp-2 text-[14px] font-black uppercase leading-tight tracking-tight text-zinc-100 hover:text-orange-400"
                >
                  {it.productName}
                </Link>
                <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  SN: <span className="font-bold text-zinc-300">{it.sku}</span>
                  {" · "}
                  STOCK:{" "}
                  <span className="font-bold text-orange-400">
                    {it.stock}
                  </span>
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="inline-flex items-center border-2 border-zinc-700 bg-zinc-950">
                    <button
                      type="button"
                      aria-label="Giảm"
                      disabled={isBusy || it.quantity <= 1}
                      onClick={() => setQuantity(it.id, it.quantity - 1)}
                      className="grid h-8 w-8 place-items-center text-zinc-400 transition hover:bg-zinc-900 hover:text-orange-400 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="mc-mono min-w-8 text-center text-[13px] font-black text-zinc-100">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Tăng"
                      disabled={isBusy || maxed}
                      onClick={() => setQuantity(it.id, it.quantity + 1)}
                      className="grid h-8 w-8 place-items-center text-zinc-400 transition hover:bg-zinc-900 hover:text-orange-400 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="mc-mono text-[14px] font-black text-orange-400">
                        {formatVnd(lineTotal)}
                      </div>
                      {it.listPrice > it.salePrice && (
                        <div className="mc-mono text-[10px] text-zinc-600 line-through">
                          {formatVnd(it.listPrice * it.quantity)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Xoá"
                      disabled={isBusy}
                      onClick={() => removeItem(it.id)}
                      className="grid h-9 w-9 place-items-center border-2 border-zinc-700 text-zinc-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
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
          <div role="alert" className="mc-mono border-2 border-red-500/60 bg-red-500/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-red-300">
            ⬢ ERR · {error}
          </div>
        )}
      </div>

      <aside className="relative h-fit border-2 border-orange-500/60 bg-zinc-900 p-5 lg:sticky lg:top-28">
        <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ DISPATCH SUMMARY
        </p>
        <h2 className="mt-2 text-[18px] font-black uppercase tracking-tight text-zinc-100">
          Tóm tắt đơn<span className="text-orange-500">.</span>
        </h2>
        <dl className="mt-4 space-y-2.5 border-t-2 border-zinc-800 pt-4 text-[12px]">
          <div className="mc-mono flex justify-between uppercase tracking-[0.15em]">
            <dt className="text-zinc-500">▸ Tạm tính ({totalQty} unit)</dt>
            <dd className="font-bold text-zinc-100">{formatVnd(subtotal)}</dd>
          </div>
          {saved > 0 && (
            <div className="mc-mono flex justify-between uppercase tracking-[0.15em]">
              <dt className="text-zinc-500">▸ Tiết kiệm</dt>
              <dd className="font-bold text-green-400">−{formatVnd(saved)}</dd>
            </div>
          )}
          <div className="my-2 h-[2px] bg-zinc-800" />
          <div className="flex items-baseline justify-between">
            <dt className="mc-mono text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500">
              ⬢ TỔNG
            </dt>
            <dd className="mc-mono text-[22px] font-black text-orange-400">
              {formatVnd(subtotal)}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          disabled={selectedIds.size === 0}
          onClick={goToCheckout}
          className="mc-btn-primary mc-btn-primary-lg mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          ⬢ THANH TOÁN →
        </button>
        <Link
          href="/products"
          className="mc-btn-outline mc-btn-outline-lg mt-2 w-full justify-center"
        >
          / TIẾP TỤC MUA
        </Link>
      </aside>
    </div>
  );
}
