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
      <section className="bg-zinc-950 text-zinc-100">
        <div className="mx-auto w-full px-4 py-16 sm:px-6 lg:w-2/3 lg:px-0">
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 px-6 py-20 text-center">
            <p className="text-[18px] font-bold text-zinc-300">Chưa có sản phẩm</p>
            <p className="mt-2 text-[14px] text-zinc-500">
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
  const spotlightCategory = spotlight.categories[0]?.name ?? "Nổi bật";

  return (
    <section className="relative bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-transparent" aria-hidden />

      <div className="relative mx-auto w-full px-4 py-14 sm:px-6 lg:w-2/3 lg:px-0 lg:py-20">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-orange-500">
              Sản phẩm nổi bật
            </p>
            <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-tight sm:text-[36px]">
              Sản phẩm mới nhất
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-[13px] font-semibold text-zinc-200 transition-all hover:border-orange-500/60 hover:text-orange-400"
          >
            Xem tất cả
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </header>

        {/* Spotlight + grid */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Spotlight Card */}
          <Link
            href={`/products/${spotlight.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 transition-all duration-300 hover:ring-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 lg:col-span-5 lg:row-span-2"
          >
            <div className="relative h-full min-h-[460px] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spotlightImage}
                alt={spotlight.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/10"
              />

              {/* Badges */}
              <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
                <span className="rounded-md bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-zinc-950 shadow">
                  {spotlightCategory}
                </span>
                {discount > 0 && (
                  <span className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                    −{discount}%
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <h3 className="text-[22px] font-bold leading-snug tracking-tight sm:text-[28px]">
                  {spotlight.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-3">
                  {price ? (
                    <>
                      <span className="text-[24px] font-bold tracking-tight text-orange-400">
                        {formatVnd(price)}
                      </span>
                      {oldPrice && (
                        <span className="text-[14px] text-zinc-500 line-through">
                          {formatVnd(oldPrice)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[14px] font-medium text-zinc-400">
                      Liên hệ báo giá
                    </span>
                  )}
                </div>
                <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-[13px] font-bold text-zinc-950 shadow-lg transition-all group-hover:bg-orange-400 group-hover:shadow-orange-500/30">
                  Xem chi tiết
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-7 lg:grid-cols-3">
            {rest.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Extra products */}
        {rest.length > 6 && (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {rest.slice(6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
