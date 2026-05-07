const items = [
  "Freeship toàn quốc",
  "Trả góp 0% lãi suất",
  "Bảo hành 24 tháng",
  "Chính hãng 100%",
  "Đổi trả miễn phí 7 ngày",
  "Giao hỏa tốc 2 giờ",
];

export function HomeMarquee() {
  const loop = [...items, ...items, ...items];
  return (
    <>
      <div className="mc-hazard h-2" />
      <section
        aria-label="Cam kết cửa hàng"
        className="overflow-hidden border-b border-zinc-800 bg-zinc-900"
      >
        <div className="flex w-max animate-[home-marquee_55s_linear_infinite] items-center py-2">
          {loop.map((it, i) => (
            <span
              key={i}
              className="mc-mono inline-flex shrink-0 items-center gap-3 whitespace-nowrap px-5 text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-400"
            >
              <span aria-hidden className="text-orange-500">⬢</span>
              {it}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
