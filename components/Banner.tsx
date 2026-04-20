const banners = [
  {
    href: "/deals/rtx-50",
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=2000&q=80",
    alt: "RTX 50 Series — Sắp ra mắt",
  },
];

export function Banner() {
  const b = banners[0];
  return (
    <section className="mx-auto w-full px-4 pt-4 sm:px-6 lg:w-2/3 lg:px-0">
      <a href={b.href} className="block overflow-hidden bg-[var(--color-surface-2)]">
        <div
          className="h-[220px] w-full bg-cover bg-center sm:h-[280px] lg:h-[320px]"
          style={{ backgroundImage: `url(${b.image})` }}
          role="img"
          aria-label={b.alt}
        />
      </a>
    </section>
  );
}
