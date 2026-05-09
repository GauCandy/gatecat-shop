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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const selected = useMemo<ProductVariant | null>(
    () => product.variants.find((v) => v.id === selectedId) ?? null,
    [product.variants, selectedId]
  );
  
  const allImages = useMemo(() => {
    const images = new Set<string>();
    if (product.imageUrl) images.add(product.imageUrl);
    for (const v of product.variants) {
      if (v.imageUrl) images.add(v.imageUrl);
    }
    return Array.from(images);
  }, [product]);

  const validImages = useMemo(() => {
    return allImages.filter((img) => !brokenImages.has(img));
  }, [allImages, brokenImages]);

  const defaultImage =
    product.variants.length === 1
      ? product.imageUrl ?? selected?.imageUrl
      : selected?.imageUrl ?? product.imageUrl;

  let currentImage = selectedImage ?? defaultImage ?? null;
  if (currentImage && brokenImages.has(currentImage)) {
    currentImage = validImages.length > 0 ? validImages[0] : null;
  }
  const mainImage = currentImage;
  const outOfStock = !!selected && selected.stock <= 0;

  const handleImageError = (url: string) => {
    setBrokenImages((prev) => new Set(prev).add(url));
  };

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
    if (ok) showFeedback({ kind: "ok", msg: "Đã thêm vào giỏ hàng" });
  };

  const onBuy = async () => {
    const ok = await addToCart();
    if (ok) router.push("/cart");
  };

  const discount =
    selected && selected.listPrice > selected.salePrice
      ? Math.round(
          ((selected.listPrice - selected.salePrice) / selected.listPrice) * 100
        )
      : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
      {/* Image section */}
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              onError={() => handleImageError(mainImage)}
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-zinc-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {validImages.map((img, i) => {
              const active = mainImage === img;
              return (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square overflow-hidden rounded-lg ring-2 transition-all ${
                    active
                      ? "ring-orange-500 shadow-md shadow-orange-500/20"
                      : "ring-zinc-800 hover:ring-zinc-600"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    onError={() => handleImageError(img)}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-5">
        {/* Categories */}
        {product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?cat=${c.id}`}
                className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-[12px] font-medium text-zinc-300 transition hover:bg-orange-500/10 hover:text-orange-400"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* Pre-order badge */}
        {product.isPreorder && (
          <div className="flex items-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-2.5 ring-1 ring-cyan-500/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <p className="text-[13px] font-semibold text-cyan-300">Sản phẩm đặt trước</p>
              <p className="text-[12px] text-cyan-400/70">Sản phẩm này là hàng pre-order, thời gian giao hàng có thể lâu hơn bình thường.</p>
            </div>
          </div>
        )}

        {/* Product name */}
        <h1 className="text-[24px] font-bold leading-tight tracking-tight text-zinc-100 sm:text-[30px]">
          {product.name}
        </h1>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-zinc-400">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-orange-400" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="font-bold text-zinc-200">{product.rating > 0 ? product.rating.toFixed(1) : "0"}</span>
            <span>({product.reviewCount} đánh giá)</span>
          </div>
          <span className="h-4 w-px bg-zinc-800" aria-hidden />
          <span>Đã bán: <span className="font-semibold text-zinc-200">{product.soldCount}</span></span>
        </div>

        {/* Price panel */}
        {selected ? (
          <div className="rounded-xl bg-zinc-900 p-5 ring-1 ring-zinc-800">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-[28px] font-bold tracking-tight text-orange-400">
                {formatVnd(selected.salePrice)}
              </span>
              {selected.listPrice > selected.salePrice && (
                <>
                  <span className="text-[16px] text-zinc-500 line-through">
                    {formatVnd(selected.listPrice)}
                  </span>
                  <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[12px] font-bold text-red-400">
                    −{discount}%
                  </span>
                </>
              )}
            </div>
            <div className="mt-3 flex items-center gap-4 border-t border-zinc-800 pt-3 text-[13px]">
              <span className="text-zinc-500">
                Mã: <span className="font-medium text-zinc-300">{selected.sku}</span>
              </span>
              <span className="text-zinc-700">·</span>
              {outOfStock ? (
                <span className="font-medium text-red-400">Hết hàng</span>
              ) : (
                <span className="text-zinc-500">
                  Kho: <span className="font-medium text-green-400">{selected.stock}</span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[14px] font-medium text-zinc-400">
            Liên hệ để biết giá
          </p>
        )}

        {/* Variant selector */}
        {product.variants.length > 1 && (
          <div>
            <p className="mb-2.5 text-[13px] font-semibold text-zinc-300">
              Phân loại ({product.variants.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const active = selectedId === v.id;
                const empty = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(v.id);
                      setSelectedImage(null);
                    }}
                    className={`rounded-lg border px-4 py-2.5 text-left transition-all ${
                      active
                        ? "border-orange-500 bg-orange-500/8 text-zinc-100 shadow-sm shadow-orange-500/10"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    <div className="text-[13px] font-semibold">{v.sku}</div>
                    <div className="mt-1 text-[12px] font-medium text-orange-400">
                      {formatVnd(v.salePrice)}
                      {empty && (
                        <span className="ml-1.5 text-red-400">· Hết</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity selector */}
        {selected && (
          <div>
            <p className="mb-2.5 text-[13px] font-semibold text-zinc-300">
              Số lượng
            </p>
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
              <button
                type="button"
                disabled={quantity <= 1 || outOfStock || busy}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="grid h-10 w-10 place-items-center text-zinc-400 transition hover:bg-zinc-800 hover:text-orange-400 disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-12 text-center text-[14px] font-bold text-zinc-100">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= selected.stock || outOfStock || busy}
                onClick={() => setQuantity(Math.min(selected.stock, quantity + 1))}
                className="grid h-10 w-10 place-items-center text-zinc-400 transition hover:bg-zinc-800 hover:text-orange-400 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-5">
          <button
            type="button"
            onClick={onBuy}
            disabled={!selected || outOfStock || busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-[14px] font-bold text-zinc-950 shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-400 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mua ngay
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!selected || outOfStock || busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3.5 text-[14px] font-semibold text-zinc-200 transition-all hover:border-orange-500/60 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-5 w-5"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Thêm giỏ hàng
          </button>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <div
            role="status"
            className={`rounded-lg px-4 py-3 text-[13px] font-semibold ${
              feedback.kind === "ok"
                ? "bg-green-500/10 text-green-300 ring-1 ring-green-500/30"
                : "bg-red-500/10 text-red-300 ring-1 ring-red-500/30"
            }`}
          >
            {feedback.kind === "ok" ? "✓" : "✕"} {feedback.msg}
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-2 rounded-xl bg-zinc-900 p-5 ring-1 ring-zinc-800">
            <h2 className="mb-3 text-[15px] font-bold text-zinc-200">
              Mô tả sản phẩm
            </h2>
            <p className="whitespace-pre-wrap text-[14px] leading-7 text-zinc-400">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
