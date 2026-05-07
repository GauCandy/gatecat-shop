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
    <section className="border-b-2 border-zinc-800 bg-zinc-900">
      <div className="mx-auto w-full px-4 py-5 sm:px-6 lg:w-2/3 lg:px-0">
        <p className="mc-mono mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ DANH MỤC NỔI BẬT
        </p>
        <CategoryStripCarousel items={featured} />
      </div>
    </section>
  );
}
