import Link from "next/link";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  specs: string[];
  rating: number;
  inStock: boolean;
};

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:border-[var(--color-text)]/30 hover:shadow-[0_4px_8px_rgba(0,0,0,0.06),0_12px_28px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <div
          className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
          style={{ backgroundImage: `url(${product.image})` }}
          role="img"
          aria-label={product.name}
        />

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--color-text)] shadow-sm backdrop-blur">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            −{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
          {product.category}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.6rem] text-[13px] font-semibold leading-snug text-[var(--color-text)]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1 text-[11px] text-[var(--color-text-dim)]">
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3 fill-amber-400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1z" />
          </svg>
          <span className="font-medium text-[var(--color-text)]">
            {product.rating.toFixed(1)}
          </span>
          <span className="mx-1 opacity-50">·</span>
          <span className={product.inStock ? "text-emerald-600" : "text-red-500"}>
            {product.inStock ? "Còn hàng" : "Hết hàng"}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-[var(--color-text)]">
            {formatVnd(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-[var(--color-text-dim)] line-through">
              {formatVnd(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
