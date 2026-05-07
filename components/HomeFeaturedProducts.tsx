import Link from "next/link";
import { listProducts } from "@/lib/products";
import { getProductVisualUrl } from "@/lib/home-assets";
import { ProductCard } from "./ProductCard";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export async function HomeFeaturedProducts() {
  const products = await listProducts();

  if (products.length === 0) {
    return (
      <section className="relative bg-zinc-950 text-zinc-100">
        <div className="mx-auto w-full px-4 py-16 sm:px-6 lg:w-2/3 lg:px-0">
          <div className="relative border-2 border-dashed border-zinc-700 bg-zinc-900 px-6 py-20 text-center">
            <span className="mc-rivet mc-rivet-tl" />
            <span className="mc-rivet mc-rivet-tr" />
            <span className="mc-rivet mc-rivet-bl" />
            <span className="mc-rivet mc-rivet-br" />
            <p className="text-[18px] font-black uppercase tracking-tight">⬢ Chưa có sản phẩm</p>
            <p className="mc-mono mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Hãy thêm sản phẩm trong trang quản trị để hiển thị tại đây.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const spotlight = products.find((p) => p.imageUrl) ?? products[0];
  const rest = products.filter((p) => p.id !== spotlight.id);

  const cheapest =
    spotlight.variants.length > 0
      ? spotlight.variants.reduce((a, b) =>
          a.salePrice <= b.salePrice ? a : b
        )
      : null;
  const price = cheapest?.salePrice ?? null;
  const oldPrice =
    cheapest && cheapest.listPrice > cheapest.salePrice ? cheapest.listPrice : null;
  const discount =
    price && oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const spotlightImage = getProductVisualUrl(spotlight, cheapest?.imageUrl);
  const spotlightCategory = spotlight.categories[0]?.name ?? "Featured";

  return (
    <section className="relative border-t-2 border-orange-500/40 bg-zinc-950 text-zinc-100">
      <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-20" />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-orange-500/20 blur-[120px]"
      />

      <div className="relative mx-auto w-full px-4 py-14 sm:px-6 lg:w-2/3 lg:px-0 lg:py-20">
        <header className="mb-10 grid items-end gap-4 border-b-2 border-zinc-800 pb-4 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.4em] text-orange-500">
              ⬢ 03 · PRODUCTION LINE
            </p>
            <h2 className="mt-3 text-[32px] font-black uppercase leading-[1.05] tracking-[-0.03em] sm:text-[48px]">
              FRESH OFF THE FLOOR<span className="text-orange-500">.</span>
            </h2>
          </div>
          <div className="sm:col-span-4 sm:text-right">
            <Link href="/products" className="mc-btn-outline">
              / FULL CATALOG →
            </Link>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-12">
          <Link
            href={`/products/${spotlight.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden border-2 border-zinc-700 bg-zinc-900 text-zinc-100 transition hover:border-orange-500 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_#09090b] lg:col-span-5 lg:row-span-2"
          >
            <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

            <div className="relative m-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spotlightImage}
                alt={spotlight.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-90"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/15"
              />
              <div aria-hidden className="mc-hex absolute inset-0 opacity-30 mix-blend-overlay" />

              <div className="relative flex h-full min-h-[460px] flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between">
                  <span className="mc-mono border border-orange-500/50 bg-zinc-950/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 backdrop-blur">
                    /{spotlightCategory}
                  </span>
                  {discount > 0 && (
                    <span className="mc-tag-warning">
                      ⬢ −{discount}%
                    </span>
                  )}
                </div>

                <div>
                  <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">
                    ⬢ DOSSIER · UNIT 0426
                  </p>
                  <h3 className="mt-3 text-[26px] font-black uppercase leading-[1.05] tracking-tight sm:text-[34px]">
                    {spotlight.name}
                  </h3>
                  <div className="mt-5 flex items-baseline gap-3">
                    {price ? (
                      <>
                        <span className="mc-mono text-[22px] font-black tracking-tight text-orange-400">
                          {formatVnd(price)}
                        </span>
                        {oldPrice && (
                          <span className="mc-mono text-[12px] text-zinc-500 line-through">
                            {formatVnd(oldPrice)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="mc-mono text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        Liên hệ
                      </span>
                    )}
                  </div>
                  <span className="mc-btn-primary mt-6">
                    ⬢ INSPECT UNIT
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4 lg:col-span-7 lg:grid-cols-3">
            {rest.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {rest.length > 6 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {rest.slice(6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
