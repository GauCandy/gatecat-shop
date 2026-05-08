import { getSiteSettings } from "@/lib/site";

export async function HomeMarquee() {
  const settings = await getSiteSettings();
  const items = settings.marqueeItems;
  const loop = [...items, ...items, ...items];
  return (
    <section
      aria-label="Cam kết cửa hàng"
      className="overflow-hidden border-b border-zinc-800 bg-zinc-900"
    >
      <div className="flex w-max animate-[home-marquee_55s_linear_infinite] items-center py-2.5">
        {loop.map((it, i) => (
          <span
            key={i}
            className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap px-5 text-[12px] font-medium text-zinc-400"
          >
            <span aria-hidden className="h-1 w-1 rounded-full bg-orange-500" />
            {it}
          </span>
        ))}
      </div>
    </section>
  );
}
