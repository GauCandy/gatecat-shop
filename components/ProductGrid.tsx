import { listProducts } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export async function ProductGrid() {
  const products = await listProducts();

  return (
    <section className="mx-auto w-full px-4 py-8 sm:px-6 lg:w-2/3 lg:px-0">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[12px] font-medium text-[var(--color-accent)]">
            Sản phẩm
          </p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-tight text-[var(--color-text)] sm:text-[26px]">
            Tất cả sản phẩm
          </h2>
        </div>
        <a
          href="/products"
          className="hidden text-[13px] font-medium text-[var(--color-accent)] transition hover:underline sm:inline"
        >
          Xem tất cả →
        </a>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-white px-6 py-16 text-center">
          <p className="text-[14px] font-medium text-[var(--color-text)]">
            Chưa có sản phẩm nào
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
            Thêm sản phẩm trong trang quản trị để hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
