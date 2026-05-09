import Link from "next/link";
import type { Product } from "@/lib/products";
import { getProductVisualUrl } from "@/lib/home-assets";

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
  const image = getProductVisualUrl(product, priceInfo?.imageUrl);
  const category = product.categories[0]?.name ?? null;
  const discount = priceInfo?.oldPrice
    ? Math.round(
        ((priceInfo.oldPrice - priceInfo.price) / priceInfo.oldPrice) * 100
      )
    : 0;
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition-all duration-300 hover:ring-orange-500/60 hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-2 right-2 top-2 flex items-start justify-between">
          <div className="flex gap-1.5">
            {product.isPreorder && (
              <span className="rounded-md bg-cyan-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                Đặt trước
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-md bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                −{discount}%
              </span>
            )}
          </div>
          {category && (
            <span className="ml-auto rounded-md bg-zinc-950/70 px-2 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-sm">
              {category}
            </span>
          )}
        </div>

        {!inStock && product.variants.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60">
            <span className="rounded-lg bg-zinc-900/90 px-3 py-1.5 text-[12px] font-semibold text-zinc-400">
              Hết hàng
            </span>
          </div>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-[12px] font-semibold text-zinc-950 shadow-md transition-transform duration-300 translate-y-3 group-hover:translate-y-0">
            Xem chi tiết
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[14px] font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-orange-400">
          {product.name}
        </h3>

        <div className="mt-auto pt-2.5">
          <div className="mb-2.5 flex items-center justify-between text-[11px] font-medium text-zinc-500">
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-orange-400" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>
                {product.rating > 0 ? product.rating.toFixed(1) : "0"} ({product.reviewCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Đã bán: {product.soldCount}</span>
            </div>
          </div>
          {priceInfo ? (
            <div className="flex items-baseline gap-2">
              <span className="text-[16px] font-bold tracking-tight text-orange-400">
                {formatVnd(priceInfo.price)}
              </span>
              {priceInfo.oldPrice && (
                <span className="text-[12px] text-zinc-500 line-through">
                  {formatVnd(priceInfo.oldPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[13px] font-medium text-zinc-500">
              Liên hệ báo giá
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
