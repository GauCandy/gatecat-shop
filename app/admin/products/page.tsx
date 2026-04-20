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
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Quản lí sản phẩm
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Thêm, chỉnh sửa và sắp xếp sản phẩm cùng các mã (SKU) kèm giá niêm yết và giá bán.
        </p>
      </div>
      <ProductManager initialProducts={products} categories={categories} />
    </div>
  );
}
