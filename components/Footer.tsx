import Link from "next/link";

const sections = [
  {
    title: "Bay",
    links: [
      { href: "/products", label: "Chassis" },
      { href: "/products", label: "Power" },
      { href: "/products", label: "Optics" },
      { href: "/products", label: "Modules" },
    ],
  },
  {
    title: "Service",
    links: [
      { href: "/support", label: "Bảo hành" },
      { href: "/warranty", label: "Trả góp" },
      { href: "/shipping", label: "Vận chuyển" },
      { href: "/returns", label: "Manual" },
    ],
  },
  {
    title: "Plant",
    links: [
      { href: "/about", label: "Về Gatecat" },
      { href: "/stores", label: "Discord" },
      { href: "/careers", label: "Tuyển dụng" },
      { href: "/contact", label: "Liên hệ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t-2 border-orange-500 bg-zinc-950 text-zinc-100">
      <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-15" />
      <div className="relative mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
        <div className="grid gap-10 border-b-2 border-zinc-800 py-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.4em] text-orange-500">
              ⬢ DISPATCH BAY
            </p>
            <h2 className="mt-5 text-[40px] font-black uppercase leading-[0.95] tracking-[-0.04em] sm:text-[58px]">
              FACTORY DISPATCH<span className="text-orange-500">.</span>
            </h2>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-zinc-400">
              Nhận build report, leak công nghệ và lịch xuất xưởng hằng tuần — biên
              tập riêng, không spam.
            </p>

            <form className="mt-7 flex w-full max-w-md gap-0 border-2 border-zinc-700 bg-zinc-900 transition focus-within:border-orange-500">
              <input
                type="email"
                required
                placeholder="OPERATOR@gatecat.heavy"
                className="mc-mono min-w-0 flex-1 bg-transparent px-3 py-3 text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              <button type="submit" className="mc-btn-primary">
                ⬢ ENLIST
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-6 lg:col-span-5">
            {sections.map((s) => (
              <div key={s.title}>
                <h3 className="mc-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">
                  ⬢ {s.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {s.links.map((l) => (
                    <li key={`${s.title}-${l.label}`}>
                      <Link
                        href={l.href}
                        className="mc-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 transition hover:text-orange-400"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-b-2 border-zinc-800 py-10 sm:flex-row sm:items-end">
          <Link href="/" className="block">
            <span className="block text-[44px] font-black uppercase leading-none tracking-[-0.04em] sm:text-[64px]">
              GATECAT<span className="text-orange-500">/</span>MCH
            </span>
            <span className="mc-mono mt-3 block text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
              ⬢ HEAVY INDUSTRIES · ISO 9001 · MADE IN VN
            </span>
          </Link>
          <div className="mc-mono flex flex-col gap-1 text-right text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 sm:items-end">
            <span>© {new Date().getFullYear()} · PLANT 01</span>
            <span>SN · GC·MCH·26</span>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 py-5 sm:flex-row sm:items-center">
          <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            © {new Date().getFullYear()} · Gatecat Shop · All rights reserved
          </p>
          <div className="mc-mono flex gap-5 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            <Link href="/privacy" className="transition hover:text-orange-400">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-orange-400">
              Terms
            </Link>
            <Link href="/contact" className="transition hover:text-orange-400">
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="mc-hazard mt-4 h-2" />
    </footer>
  );
}
