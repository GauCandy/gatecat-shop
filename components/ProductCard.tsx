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

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden border-2 border-zinc-800 bg-zinc-900 transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-orange-500 hover:shadow-[6px_6px_0_#09090b]"
    >
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <span className="mc-rivet mc-rivet-bl" />
      <span className="mc-rivet mc-rivet-br" />

      <div className="relative m-2 aspect-square overflow-hidden bg-zinc-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="relative h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        />

        <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay" />

        {discount > 0 && (
          <span className="mc-tag-warning absolute right-2 top-2">
            ⬢ −{discount}%
          </span>
        )}

        {category && (
          <span className="mc-mono absolute left-2 top-2 border border-orange-500/50 bg-zinc-950/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.28em] text-orange-400 backdrop-blur">
            /{category}
          </span>
        )}

        <span
          aria-hidden
          className="mc-mono pointer-events-none absolute inset-x-2 bottom-2 inline-flex translate-y-3 items-center justify-between gap-2 bg-orange-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-950 opacity-0 shadow-[2px_2px_0_#09090b] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <span>⬢ INSPECT</span>
          <span>→</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col border-t-2 border-zinc-800 p-3">
        <h3 className="line-clamp-2 min-h-[2.4rem] text-[13px] font-black uppercase leading-tight tracking-tight text-zinc-100 transition group-hover:text-orange-400">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 border-t-2 border-zinc-800">
          {priceInfo ? (
            <>
              <p className="mc-mono text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                UNIT COST
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="mc-mono text-[15px] font-black tracking-tight text-orange-400">
                  {formatVnd(priceInfo.price)}
                </span>
                {priceInfo.oldPrice && (
                  <span className="mc-mono text-[10px] text-zinc-500 line-through">
                    {formatVnd(priceInfo.oldPrice)}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="mc-mono text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Liên hệ
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
