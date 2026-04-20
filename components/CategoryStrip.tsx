import { listCategories } from "@/lib/categories";
import { CategoryStripCarousel } from "./CategoryStripCarousel";

export async function CategoryStrip() {
  const all = await listCategories();

  if (all.length === 0) return null;

  return (
    <section className="border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto w-full px-4 py-5 sm:px-6 lg:w-2/3 lg:px-0">
        <CategoryStripCarousel items={all} />
      </div>
    </section>
  );
}
