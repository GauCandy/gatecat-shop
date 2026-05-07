import { listCategories } from "@/lib/categories";
import { CategoryManager } from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ ADMIN · 03 · CLASS BAY
        </p>
        <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
          Quản lí danh mục<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Thêm, chỉnh sửa và sắp xếp các danh mục sản phẩm.
        </p>
      </div>
      <CategoryManager initial={categories} />
    </div>
  );
}
