import { buildTree, listCategories } from "@/lib/categories";
import type { CategoryNode } from "@/lib/categories-types";
import { CategoryStripCarousel } from "./CategoryStripCarousel";

export async function CategoryStrip() {
  const all = await listCategories();
  const tree = buildTree(all);

  const featured: CategoryNode[] = [];
  const walk = (nodes: CategoryNode[]) => {
    for (const n of nodes) {
      if (n.isFeatured) featured.push(n);
      walk(n.children);
    }
  };
  walk(tree);

  featured.sort((a, b) => a.name.localeCompare(b.name, "vi"));

  if (featured.length === 0) return null;

  return (
    <section className="border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto w-full px-4 py-5 sm:px-6 lg:w-2/3 lg:px-0">
        <h2 className="mb-3 text-[14px] font-semibold text-[var(--color-text)]">
          Danh mục nổi bật
        </h2>
        <CategoryStripCarousel items={featured} />
      </div>
    </section>
  );
}
