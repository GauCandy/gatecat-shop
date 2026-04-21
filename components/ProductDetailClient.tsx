"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product, ProductVariant } from "@/lib/products";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export function ProductDetailClient({ product }: { product: Product }) {
  const hasVariants = product.variants.length > 0;
  const [selectedId, setSelectedId] = useState<string | null>(
    hasVariants ? product.variants[0].id : null
  );
  const selected = useMemo<ProductVariant | null>(
    () => product.variants.find((v) => v.id === selectedId) ?? null,
    [product.variants, selectedId]
  );
  const mainImage = selected?.imageUrl ?? product.imageUrl ?? null;
  const outOfStock = !!selected && selected.stock <= 0;

  const onBuy = () => {
    if (!selected) return;
    alert(
      `Chức năng mua hàng đang hoàn thiện.\nBạn vừa chọn: ${selected.sku}`
    );
  };
  const onAddToCart = () => {
    if (!selected) return;
    alert(`Đã ghi nhận: thêm ${selected.sku} vào giỏ hàng (demo).`);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)]">
          {mainImage ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${mainImage})` }}
              role="img"
              aria-label={product.name}
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
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${img})` }}
                      role="img"
                      aria-label={v.sku}
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

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBuy}
            disabled={!selected || outOfStock}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-[14px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mua ngay
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!selected || outOfStock}
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
