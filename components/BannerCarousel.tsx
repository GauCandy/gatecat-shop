"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BannerItem = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
};

export function BannerCarousel({ items }: { items: BannerItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [items.length, paused]);

  if (items.length === 0) return null;

  const goPrev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div
      className="group relative overflow-hidden bg-zinc-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] sm:aspect-[12/5] lg:aspect-[5/2]">
        {items.map((b, i) => {
          const isActive = i === index;
          const slide = (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={b.imageUrl}
              alt={b.title ?? ""}
              decoding="async"
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          );
          return (
            <div
              key={b.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
            >
              {b.linkUrl ? (
                <Link
                  href={b.linkUrl}
                  tabIndex={isActive ? 0 : -1}
                  className="block h-full w-full"
                >
                  {slide}
                </Link>
              ) : (
                <div className="h-full w-full">{slide}</div>
              )}
            </div>
          );
        })}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Banner trước"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center border-2 border-zinc-700 bg-zinc-900/90 text-[18px] font-black text-orange-500 shadow-[3px_3px_0_#09090b] transition hover:border-orange-500 hover:bg-orange-500 hover:text-zinc-950 md:opacity-0 md:group-hover:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Banner kế"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center border-2 border-zinc-700 bg-zinc-900/90 text-[18px] font-black text-orange-500 shadow-[3px_3px_0_#09090b] transition hover:border-orange-500 hover:bg-orange-500 hover:text-zinc-950 md:opacity-0 md:group-hover:opacity-100"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 border-2 border-zinc-700 bg-zinc-950/85 px-2 py-1.5 backdrop-blur">
            {items.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Đến banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 transition-all duration-300 ${
                  i === index ? "w-7 bg-orange-500" : "w-1.5 bg-zinc-600 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
