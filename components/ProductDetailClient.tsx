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
        <div className="relative aspect-square w-full overflow-hidden">
          <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
          <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
          <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
          <span className="mc-rivet mc-rivet-br mc-rivet-lg" />
          <div className="absolute inset-2 overflow-hidden border-2 border-zinc-700 bg-zinc-900">
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
              <div className="mc-mono grid h-full w-full place-items-center text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                ⬢ NO IMAGE
              </div>
            )}
            <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay" />
          </div>
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
                  className={`aspect-square overflow-hidden border-2 transition ${
                    active
                      ? "border-orange-500 shadow-[3px_3px_0_#09090b]"
                      : "border-zinc-800 hover:border-zinc-600"
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
                    <div className="grid h-full w-full place-items-center bg-zinc-950 text-[10px] text-zinc-600">
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
                className="mc-mono inline-flex items-center border border-orange-500/50 bg-zinc-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400 transition hover:border-orange-500 hover:text-orange-300"
              >
                /{c.name}
              </Link>
            ))}
          </div>
        )}

        <div>
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ DOSSIER
          </p>
          <h1 className="mt-2 text-[24px] font-black uppercase leading-tight tracking-[-0.03em] text-zinc-100 sm:text-[30px]">
            {product.name}<span className="text-orange-500">.</span>
          </h1>
        </div>

        {selected ? (
          <div className="relative border-2 border-orange-500/60 bg-zinc-900 p-5">
            <span className="mc-rivet mc-rivet-tl" />
            <span className="mc-rivet mc-rivet-tr" />
            <span className="mc-rivet mc-rivet-bl" />
            <span className="mc-rivet mc-rivet-br" />

            <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
              ⬢ UNIT COST
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="mc-mono text-[28px] font-black text-orange-400">
                {formatVnd(selected.salePrice)}
              </span>
              {selected.listPrice > selected.salePrice && (
                <>
                  <span className="mc-mono text-[14px] text-zinc-500 line-through">
                    {formatVnd(selected.listPrice)}
                  </span>
                  <span className="mc-tag-warning">
                    ⬢ −
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
            <p className="mc-mono mt-3 border-t-2 border-zinc-800 pt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              SN: <span className="text-zinc-300">{selected.sku}</span>
              {" · "}
              {outOfStock ? (
                <span className="text-red-400">⚠ HẾT HÀNG</span>
              ) : (
                <>
                  STOCK:{" "}
                  <span className="text-orange-400">
                    {selected.stock}
                  </span>
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="mc-mono text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            ▸ Liên hệ để biết giá
          </p>
        )}

        {product.variants.length > 1 && (
          <div>
            <p className="mc-mono mb-2 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
              ⬢ CHỌN MÃ ({product.variants.length})
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
                    className={`mc-mono border-2 px-3 py-2 text-left transition ${
                      active
                        ? "border-orange-500 bg-orange-500/8 text-zinc-100 shadow-[3px_3px_0_#09090b]"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.18em]">{v.sku}</div>
                    <div className="mt-1 text-[11px] font-bold text-orange-400">
                      {formatVnd(v.salePrice)}
                      {empty && (
                        <span className="ml-1 text-red-400">⚠ HẾT</span>
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
            <p className="mc-mono mb-2 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
              ⬢ SỐ LƯỢNG
            </p>
            <div className="inline-flex items-center border-2 border-zinc-700 bg-zinc-900">
              <button
                type="button"
                disabled={quantity <= 1 || outOfStock || busy}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="grid h-10 w-10 place-items-center text-zinc-400 transition hover:bg-zinc-950 hover:text-orange-400 disabled:opacity-40"
              >
                −
              </button>
              <span className="mc-mono min-w-10 text-center text-[14px] font-black text-zinc-100">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= selected.stock || outOfStock || busy}
                onClick={() => setQuantity(Math.min(selected.stock, quantity + 1))}
                className="grid h-10 w-10 place-items-center text-zinc-400 transition hover:bg-zinc-950 hover:text-orange-400 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-t-2 border-zinc-800 pt-4">
          <button
            type="button"
            onClick={onBuy}
            disabled={!selected || outOfStock || busy}
            className="mc-btn-primary mc-btn-primary-lg flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            ⬢ MUA NGAY →
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!selected || outOfStock || busy}
            className="mc-btn-outline mc-btn-outline-lg flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"
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
            THÊM GIỎ
          </button>
        </div>

        {feedback && (
          <div
            role="status"
            className={`mc-mono border-2 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${
              feedback.kind === "ok"
                ? "border-green-500/60 bg-green-500/10 text-green-300"
                : "border-red-500/60 bg-red-500/10 text-red-300"
            }`}
          >
            ⬢ {feedback.msg}
          </div>
        )}

        {product.description && (
          <div className="relative mt-2 border-2 border-zinc-800 bg-zinc-900 p-5">
            <span className="mc-rivet mc-rivet-tl" />
            <span className="mc-rivet mc-rivet-tr" />
            <span className="mc-rivet mc-rivet-bl" />
            <span className="mc-rivet mc-rivet-br" />
            <p className="mc-mono mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
              ⬢ MANUAL · MÔ TẢ SẢN PHẨM
            </p>
            <p className="whitespace-pre-wrap text-[13px] leading-6 text-zinc-400">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
