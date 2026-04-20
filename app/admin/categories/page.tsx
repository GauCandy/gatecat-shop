import { listCategories } from "@/lib/categories";
import { CategoryManager } from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Quản lí danh mục
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Thêm, chỉnh sửa và sắp xếp các danh mục sản phẩm hiển thị trên website.
        </p>
      </div>
      <CategoryManager initial={categories} />
    </div>
  );
}
