"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, ProductVariant } from "@/lib/products";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

type Feedback = { kind: "ok" | "err"; msg: string } | null;

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const hasVariants = product.variants.length > 0;
  const [selectedId, setSelectedId] = useState<string | null>(
    hasVariants ? product.variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const selected = useMemo<ProductVariant | null>(
    () => product.variants.find((v) => v.id === selectedId) ?? null,
    [product.variants, selectedId]
  );
  const mainImage = selected?.imageUrl ?? product.imageUrl ?? null;
  const outOfStock = !!selected && selected.stock <= 0;

  const showFeedback = (f: Feedback) => {
    setFeedback(f);
    if (f) window.setTimeout(() => setFeedback(null), 3000);
  };

  const addToCart = async (): Promise<boolean> => {
    if (!selected || outOfStock || busy) return false;
    setBusy(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selected.id, quantity }),
      });
      if (res.status === 401) {
        router.push("/login");
        return false;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showFeedback({ kind: "err", msg: data?.error ?? "Không thêm được" });
        return false;
      }
      router.refresh();
      return true;
    } catch {
      showFeedback({ kind: "err", msg: "Lỗi kết nối" });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const onAddToCart = async () => {
    const ok = await addToCart();
    if (ok) showFeedback({ kind: "ok", msg: "Đã thêm vào giỏ" });
  };

  const onBuy = async () => {
    const ok = await addToCart();
    if (ok) router.push("/cart");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)]">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImage}
              alt={product.name}
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[13px] text-[var(--color-text-dim)]">
              Không có ảnh
            </div>
          )}
        </div>

        {product.variants.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {product.variants.map((v) => {
              const img = v.imageUrl ?? product.imageUrl;
              const active = selectedId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  aria-label={v.sku}
                  className={`aspect-square overflow-hidden rounded-lg border transition ${
                    active
                      ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40"
                      : "border-[var(--color-border)] hover:border-[var(--color-text)]/40"
                  }`}
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={v.sku}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[var(--color-surface-2)] text-[10px] text-[var(--color-text-dim)]">
                      —
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-dim)] transition hover:border-[var(--color-text)]/30 hover:text-[var(--color-text)]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <h1 className="text-[24px] font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-[28px]">
          {product.name}
        </h1>

        {selected ? (
          <div className="rounded-2xl border border-[var(--color-border-strong)] bg-white p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-[26px] font-semibold text-[var(--color-text)]">
                {formatVnd(selected.salePrice)}
              </span>
              {selected.listPrice > selected.salePrice && (
                <>
                  <span className="text-[14px] text-[var(--color-text-dim)] line-through">
                    {formatVnd(selected.listPrice)}
                  </span>
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                    −
                    {Math.round(
                      ((selected.listPrice - selected.salePrice) /
                        selected.listPrice) *
                        100
                    )}
                    %
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-[12px] text-[var(--color-text-dim)]">
              Mã: <span className="font-medium">{selected.sku}</span>
              {" · "}
              {outOfStock ? (
                <span className="font-medium text-red-600">Hết hàng</span>
              ) : (
                <>
                  Tồn kho:{" "}
                  <span className="font-medium text-[var(--color-text)]">
                    {selected.stock}
                  </span>
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-[var(--color-text-dim)]">Liên hệ để biết giá</p>
        )}

        {product.variants.length > 1 && (
          <div>
            <p className="mb-2 text-[12px] font-medium text-[var(--color-text-dim)]">
              Chọn mã ({product.variants.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const active = selectedId === v.id;
                const empty = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedId(v.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                      active
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-text)]"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text-dim)] hover:border-[var(--color-text)]/40 hover:text-[var(--color-text)]"
                    }`}
                  >
                    <div className="font-medium">{v.sku}</div>
                    <div className="mt-0.5 text-[11px]">
                      {formatVnd(v.salePrice)}
                      {empty && (
                        <span className="ml-1 text-red-600">(hết)</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selected && (
          <div>
            <p className="mb-2 text-[12px] font-medium text-[var(--color-text)]">
              Số lượng
            </p>
            <div className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-white">
              <button
                type="button"
                disabled={quantity <= 1 || outOfStock || busy}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="grid h-10 w-10 place-items-center text-[var(--color-text-dim)] transition hover:text-[var(--color-text)] disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-10 text-center text-[14px] font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= selected.stock || outOfStock || busy}
                onClick={() => setQuantity(Math.min(selected.stock, quantity + 1))}
                className="grid h-10 w-10 place-items-center text-[var(--color-text-dim)] transition hover:text-[var(--color-text)] disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBuy}
            disabled={!selected || outOfStock || busy}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-[14px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mua ngay
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!selected || outOfStock || busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-text)] bg-white px-6 py-3 text-[14px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
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
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Thêm vào giỏ
          </button>
        </div>

        {feedback && (
          <div
            role="status"
            className={`rounded-lg px-3 py-2 text-[12px] ${
              feedback.kind === "ok"
                ? "bg-green-500/10 text-green-700"
                : "bg-red-500/10 text-red-700"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {product.description && (
          <div className="mt-2 rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text)]">
              Mô tả sản phẩm
            </h2>
            <p className="whitespace-pre-wrap text-[13px] leading-6 text-[var(--color-text-dim)]">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
