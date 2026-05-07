import { listCategories } from "@/lib/categories";
import { listProducts } from "@/lib/products";
import { ProductManager } from "./ProductManager";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ ADMIN · 04 · INVENTORY
        </p>
        <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
          Quản lí sản phẩm<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Thêm, chỉnh sửa và sắp xếp SP cùng SKU, giá niêm yết và giá bán.
        </p>
      </div>
      <ProductManager initialProducts={products} categories={categories} />
    </div>
  );
}
