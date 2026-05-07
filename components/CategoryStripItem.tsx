import Link from "next/link";
import type { CategoryNode } from "@/lib/categories";
import { getCategoryVisualUrl } from "@/lib/home-assets";

export function CategoryStripItem({
  node,
  className = "",
}: {
  node: CategoryNode;
  className?: string;
}) {
  const imageUrl = getCategoryVisualUrl(node);

  return (
    <li className={`relative ${className}`}>
      <Link
        href={`/category/${node.slug}`}
        className="group flex flex-col items-center gap-1.5 border-2 border-zinc-800 bg-zinc-950 p-2 transition hover:border-orange-500 hover:bg-zinc-900"
      >
        <span
          className="grid h-9 w-9 place-items-center overflow-hidden border-2 border-zinc-700 bg-zinc-900 text-[12px] font-black text-zinc-400 transition group-hover:border-orange-500 group-hover:bg-orange-500/10 group-hover:text-orange-400"
          aria-hidden
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-6 w-6 object-contain"
            />
          ) : (
            node.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="mc-mono line-clamp-1 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 transition group-hover:text-orange-400">
          {node.name}
        </span>
      </Link>
    </li>
  );
}
