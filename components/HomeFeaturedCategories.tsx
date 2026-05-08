import Link from "next/link";
import { buildTree, listCategories } from "@/lib/categories";
import type { CategoryNode } from "@/lib/categories-types";
import { getCategoryVisualUrl } from "@/lib/home-assets";

const SPANS = [
  "sm:col-span-3 sm:row-span-2 lg:col-span-4 lg:row-span-2",
  "sm:col-span-3 lg:col-span-4",
  "sm:col-span-3 lg:col-span-4",
  "sm:col-span-2 lg:col-span-3",
  "sm:col-span-2 lg:col-span-3",
  "sm:col-span-2 lg:col-span-2",
  "sm:col-span-3 lg:col-span-4",
  "sm:col-span-3 lg:col-span-4",
  "sm:col-span-2 lg:col-span-2",
  "sm:col-span-2 lg:col-span-3",
  "sm:col-span-2 lg:col-span-3",
];

export async function HomeFeaturedCategories() {
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

  if (featured.length === 0) return null;

  featured.sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return (
    <section className="relative bg-zinc-900 text-zinc-100">
      <div className="relative mx-auto w-full px-4 py-14 sm:px-6 lg:w-2/3 lg:px-0 lg:py-20">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-orange-500">
              Danh mục nổi bật
            </p>
            <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-tight sm:text-[40px]">
              Mua sắm theo danh mục
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-[13px] font-semibold text-zinc-200 transition-all hover:border-orange-500/60 hover:text-orange-400"
          >
            Xem tất cả
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </header>

        <ul className="grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[140px] sm:grid-cols-6 lg:auto-rows-[160px] lg:grid-cols-12">
          {featured.map((c, i) => {
            const imageUrl = getCategoryVisualUrl(c);
            const span = SPANS[i % SPANS.length];
            return (
              <li
                key={c.id}
                className={`group relative col-span-1 overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-zinc-800 transition-all duration-300 hover:ring-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-0.5 ${span}`}
              >
                <Link href={`/category/${c.slug}`} className="block h-full w-full">
                  <div className="absolute inset-0 overflow-hidden">
                    {imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute inset-0 grid place-items-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-6xl font-black text-orange-500/20"
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent transition group-hover:from-zinc-950/90"
                    />

                    <div className="relative flex h-full flex-col justify-end p-4 sm:p-5">
                      <p className="text-[15px] font-bold leading-tight sm:text-[17px]">
                        {c.name}
                      </p>
                      <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-orange-400 transition group-hover:text-orange-300">
                        Khám phá
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden>
                          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                        </svg>
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
