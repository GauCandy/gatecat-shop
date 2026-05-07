import Link from "next/link";
import { listProducts } from "@/lib/products";
import { HOME_ASSETS } from "@/lib/home-assets";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export async function HomeHero() {
  const products = await listProducts();
  const featured = products.find((p) => p.imageUrl) ?? products[0] ?? null;

  if (!featured) {
    return (
      <section className="bg-[var(--color-paper)] py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="font-display text-[44px] tracking-tight sm:text-[56px]">
            Gatecat
          </h1>
          <p className="mt-4 text-[14px] text-[var(--color-mute)]">
            Cửa hàng đang cập nhật sản phẩm.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-cobalt)] px-6 py-3 text-[13px] font-semibold text-white transition hover:bg-[var(--color-cobalt)]/85"
          >
            Xem tất cả →
          </Link>
        </div>
      </section>
    );
  }

  const cheapest =
    featured.variants.length > 0
      ? featured.variants.reduce((a, b) =>
          a.salePrice <= b.salePrice ? a : b
        )
      : null;
  const price = cheapest?.salePrice ?? null;
  const oldPrice =
    cheapest && cheapest.listPrice > cheapest.salePrice
      ? cheapest.listPrice
      : null;
  const image = featured.imageUrl ?? cheapest?.imageUrl ?? HOME_ASSETS.heroFeatured;
  const discount =
    oldPrice && price ? Math.round((1 - price / oldPrice) * 100) : 0;

  const trust = [
    "Freeship toàn quốc",
    "Bảo hành 24 tháng",
    "Trả góp 0%",
    "Đổi trả 7 ngày",
  ];

  return (
    <section
      className="relative bg-[var(--color-paper)] text-[var(--color-ink)]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(247,245,240,0.86), rgba(247,245,240,1) 72%), url(${HOME_ASSETS.patternGridFade})`,
        backgroundPosition: "center top",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto grid grid-cols-12 items-center gap-8 px-4 py-12 sm:px-6 lg:w-2/3 lg:gap-12 lg:px-0 lg:py-20">
        <div className="rise-in col-span-12 flex flex-col lg:col-span-6">
          <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-[var(--color-cobalt)]">
            Sản phẩm nổi bật
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.02] tracking-[-0.03em] sm:text-[52px] lg:text-[64px]">
            {featured.name}
          </h1>

          {featured.description && (
            <p className="mt-5 line-clamp-3 max-w-lg text-[14px] leading-relaxed text-[var(--color-ink)]/70 sm:text-[15px]">
              {featured.description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-baseline gap-3">
            {price ? (
              <>
                <span className="font-display text-[34px] font-bold tracking-tight text-[var(--color-cobalt)]">
                  {formatVnd(price)}
                </span>
                {oldPrice && (
                  <span className="font-tech text-[13px] text-[var(--color-mute)] line-through">
                    {formatVnd(oldPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="font-tech rounded-full bg-[var(--color-cobalt-soft)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-cobalt)]">
                    −{discount}%
                  </span>
                )}
              </>
            ) : (
              <span className="font-tech text-[14px] text-[var(--color-mute)]">
                Liên hệ
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/products/${featured.slug}`}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-cobalt)] px-7 py-3.5 text-[14px] font-semibold text-white transition hover:bg-[var(--color-cobalt)]/90"
            >
              <span className="relative z-10">Mua ngay</span>
              <span className="relative z-10 grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[10px] transition group-hover:translate-x-0.5">
                →
              </span>
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink)]/20 px-5 py-3 text-[13px] font-medium text-[var(--color-ink)] transition hover:border-[var(--color-cobalt)] hover:text-[var(--color-cobalt)]"
            >
              Xem tất cả
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--color-ink)]/10 pt-6 sm:grid-cols-4">
            {trust.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2 text-[12px] text-[var(--color-ink)]/75"
              >
                <span
                  aria-hidden
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--color-cobalt-soft)] text-[var(--color-cobalt)]"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <polyline points="4 11 8 15 16 6" />
                  </svg>
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rise-in-200 col-span-12 lg:col-span-6">
          <Link
            href={`/products/${featured.slug}`}
            className="group relative block overflow-hidden rounded-[28px] bg-[var(--color-paper-2)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-12 opacity-0 blur-3xl transition duration-700 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(29,78,216,0.4), transparent 60%)",
              }}
            />
            <div className="relative aspect-[5/4] sm:aspect-[6/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={featured.name}
                fetchPriority="high"
                className="h-full w-full object-cover transition duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
            </div>

            {discount > 0 && (
              <span className="font-tech absolute left-5 top-5 rounded-full bg-[var(--color-cobalt)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                Giảm {discount}%
              </span>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
