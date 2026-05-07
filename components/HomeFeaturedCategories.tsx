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
      <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-25" />
      <div className="relative mx-auto w-full px-4 py-14 sm:px-6 lg:w-2/3 lg:px-0 lg:py-20">
        <header className="mb-10 grid items-end gap-4 border-b-2 border-zinc-800 pb-4 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.4em] text-orange-500">
              ⬢ 02 · COMPONENT BAY
            </p>
            <h2 className="mt-3 text-[32px] font-black uppercase leading-[1.05] tracking-[-0.03em] sm:text-[48px]">
              MODULES BY CLASS<span className="text-orange-500">.</span>
            </h2>
          </div>
          <div className="sm:col-span-4 sm:text-right">
            <Link href="/products" className="mc-btn-outline">
              / FULL CATALOG →
            </Link>
          </div>
        </header>

        <ul className="grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[140px] sm:grid-cols-6 lg:auto-rows-[160px] lg:grid-cols-12">
          {featured.map((c, i) => {
            const imageUrl = getCategoryVisualUrl(c);
            const span = SPANS[i % SPANS.length];
            return (
              <li
                key={c.id}
                className={`group relative col-span-1 overflow-hidden border-2 border-zinc-800 bg-zinc-950 transition hover:border-orange-500 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#09090b] ${span}`}
              >
                <span className="mc-rivet mc-rivet-tl" />
                <span className="mc-rivet mc-rivet-tr" />
                <span className="mc-rivet mc-rivet-bl" />
                <span className="mc-rivet mc-rivet-br" />

                <Link href={`/category/${c.slug}`} className="block h-full w-full">
                  <div className="absolute inset-1 overflow-hidden">
                    {imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.06] group-hover:opacity-100"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute inset-0 grid place-items-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-6xl font-black text-orange-500/30"
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div
                      aria-hidden
                      className="mc-hex absolute inset-0 opacity-30 mix-blend-overlay"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent transition group-hover:from-zinc-950"
                    />

                    <div className="relative flex h-full flex-col justify-between p-3 text-zinc-100 sm:p-4">
                      <span className="mc-mono self-start border border-orange-500/50 bg-zinc-950/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.3em] text-orange-400 backdrop-blur">
                        MOD/{String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-[14px] font-black uppercase leading-tight tracking-tight sm:text-[16px]">
                          {c.name}
                        </p>
                        <p className="mc-mono mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400 transition group-hover:text-orange-300">
                          ⬢ Xem
                          <span className="transition group-hover:translate-x-0.5">→</span>
                        </p>
                      </div>
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
