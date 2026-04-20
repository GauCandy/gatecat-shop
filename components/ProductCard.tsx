import Link from "next/link";
import type { Product } from "@/lib/products";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

function getDisplayPrice(p: Product) {
  if (p.variants.length === 0) return null;
  const cheapest = p.variants.reduce((a, b) =>
    a.salePrice <= b.salePrice ? a : b
  );
  return {
    price: cheapest.salePrice,
    oldPrice:
      cheapest.listPrice > cheapest.salePrice ? cheapest.listPrice : null,
    imageUrl: cheapest.imageUrl,
  };
}

export function ProductCard({ product }: { product: Product }) {
  const priceInfo = getDisplayPrice(product);
  const image = product.imageUrl ?? priceInfo?.imageUrl ?? null;
  const category = product.categories[0]?.name ?? null;
  const discount = priceInfo?.oldPrice
    ? Math.round(
        ((priceInfo.oldPrice - priceInfo.price) / priceInfo.oldPrice) * 100
      )
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:border-[var(--color-text)]/30 hover:shadow-[0_4px_8px_rgba(0,0,0,0.06),0_12px_28px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
        {image ? (
          <div
            className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${image})` }}
            role="img"
            aria-label={product.name}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[11px] text-[var(--color-text-dim)]">
            Không có ảnh
          </div>
        )}

        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            −{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {category && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
            {category}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 min-h-[2.6rem] text-[13px] font-semibold leading-snug text-[var(--color-text)]">
          {product.name}
        </h3>

        <div className="mt-auto pt-3">
          {priceInfo ? (
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold text-[var(--color-text)]">
                {formatVnd(priceInfo.price)}
              </span>
              {priceInfo.oldPrice && (
                <span className="text-[11px] text-[var(--color-text-dim)] line-through">
                  {formatVnd(priceInfo.oldPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[13px] text-[var(--color-text-dim)]">
              Liên hệ
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
