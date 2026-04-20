"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/categories-types";
import { CategoryStripItem } from "./CategoryStripItem";

export function CategoryStripCarousel({ items }: { items: Category[] }) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    update();
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        aria-label="Danh mục trước"
        disabled={!canPrev}
        className={`absolute left-0 top-1/2 z-10 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow transition hover:bg-[var(--color-surface-2)] ${
          canPrev ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-4 w-4"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <ul
        ref={scrollRef}
        onScroll={update}
        className="grid grid-flow-col grid-rows-2 auto-cols-[calc((100%-56px)/8)] gap-2 snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((c) => (
          <CategoryStripItem
            key={c.id}
            node={{ ...c, children: [] }}
            className="snap-start"
          />
        ))}
      </ul>

      <button
        type="button"
        onClick={() => scrollByPage(1)}
        aria-label="Danh mục tiếp"
        disabled={!canNext}
        className={`absolute right-0 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow transition hover:bg-[var(--color-surface-2)] ${
          canNext ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-4 w-4"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
