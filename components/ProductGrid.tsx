import { listProducts } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export async function ProductGrid() {
  const products = await listProducts();

  return (
    <section className="mx-auto w-full px-4 py-8 sm:px-6 lg:w-2/3 lg:px-0">
      <div className="mb-5 flex items-end justify-between border-b-2 border-zinc-800 pb-4">
        <div>
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ INVENTORY · TẤT CẢ SẢN PHẨM
          </p>
          <h2 className="mt-2 text-[22px] font-black uppercase leading-[1.05] tracking-[-0.03em] text-zinc-100 sm:text-[28px]">
            Production line<span className="text-orange-500">.</span>
          </h2>
        </div>
        <a href="/products" className="mc-btn-outline hidden sm:inline-flex">
          / FULL CATALOG →
        </a>
      </div>

      {products.length === 0 ? (
        <div className="relative border-2 border-dashed border-zinc-700 bg-zinc-900 px-6 py-16 text-center">
          <span className="mc-rivet mc-rivet-tl" />
          <span className="mc-rivet mc-rivet-tr" />
          <span className="mc-rivet mc-rivet-bl" />
          <span className="mc-rivet mc-rivet-br" />
          <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
            ⬢ INVENTORY EMPTY
          </p>
          <p className="mc-mono mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            ▸ Thêm sản phẩm trong trang quản trị để hiển thị tại đây.
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
