import Link from "next/link";
import { mockProducts, mockCategories, formatVnd, marqueeItems } from "../_data/mock";

export const metadata = { title: "Style · Mecha Industrial" };

export default function MechaPage() {
  const loop = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="mc-root min-h-screen text-zinc-100">
      <style>{cssBlock}</style>

      {/* HAZARD STRIP TOP */}
      <div className="mc-hazard h-2" />

      {/* TOP BAR */}
      <div className="relative overflow-hidden border-b border-zinc-700 bg-zinc-900">
        <div className="flex w-max animate-[mc-marquee_45s_linear_infinite] items-center py-2">
          {loop.map((it, i) => (
            <span key={i} className="mc-mono inline-flex shrink-0 items-center gap-3 whitespace-nowrap px-5 text-[10px] uppercase tracking-[0.32em] text-zinc-400">
              <span className="text-orange-500">⬢</span>
              {it}
            </span>
          ))}
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b-2 border-orange-500 bg-zinc-950/95 backdrop-blur-md">
        <div className="mc-hex pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto flex h-[72px] w-full items-center gap-6 px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <Link href="/style" className="flex items-center gap-3">
            <span className="mc-plate grid h-12 w-12 place-items-center font-black">
              <span className="mc-rivet mc-rivet-tl" />
              <span className="mc-rivet mc-rivet-tr" />
              <span className="mc-rivet mc-rivet-bl" />
              <span className="mc-rivet mc-rivet-br" />
              <span className="text-orange-500">⬢</span>
            </span>
            <span className="leading-none">
              <span className="block text-[18px] font-black uppercase tracking-[0.06em] text-zinc-100">
                GATECAT<span className="text-orange-500">/</span>MCH
              </span>
              <span className="mc-mono mt-1 block text-[8px] uppercase tracking-[0.4em] text-zinc-500">
                ⬢ heavy industries · v2.6
              </span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {["CHASSIS", "POWER", "OPTICS", "MODULES", "SVC"].map((n) => (
              <Link key={n} href="#" className="mc-navlink mc-mono text-[11px] uppercase tracking-[0.22em] font-bold">
                {n}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="mc-mono hidden items-center gap-2 border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.28em] text-zinc-400 md:flex">
              <span className="h-2 w-2 rounded-full bg-orange-500 [animation:mc-pulse_1.4s_ease-in-out_infinite]" />
              SYS·LOAD <span className="text-orange-400">87%</span>
            </div>
            <button className="grid h-9 w-9 place-items-center border-2 border-zinc-700 text-zinc-400 transition hover:border-orange-500 hover:text-orange-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <Link href="#" className="mc-btn-primary mc-mono text-[10px] uppercase tracking-[0.28em] font-black">
              ⬢ ENGAGE
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b-2 border-orange-500/40 bg-zinc-950">
        <div className="mc-hex pointer-events-none absolute inset-0 opacity-30" />
        <span className="pointer-events-none absolute -right-24 top-10 h-[480px] w-[480px] rounded-full bg-orange-500/20 blur-[160px]" />
        <span className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-yellow-500/15 blur-[140px]" />

        <div className="relative mx-auto w-full px-4 py-16 sm:px-6 lg:w-2/3 lg:px-0 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mc-mono inline-flex items-center gap-3 border-l-4 border-orange-500 bg-zinc-900 px-3 py-1.5 text-[10px] uppercase tracking-[0.32em] text-orange-400">
                <span>⬢ MFG_LOG · UNIT 0426 · COMMISSIONED</span>
              </div>

              <h1 className="mc-h1 mt-6">
                <span className="block text-[44px] font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-[68px] lg:text-[92px]">
                  HEAVY DUTY.
                </span>
                <span className="block text-[44px] font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-[68px] lg:text-[92px]">
                  <span className="mc-stroke-orange">MAX OUTPUT.</span>
                </span>
              </h1>

              <p className="mt-7 max-w-md text-[14px] leading-relaxed text-zinc-400">
                Mỗi rig được rivet, lắp ráp, và stress-test ở 110% công suất trong
                72 giờ. Khi rời nhà máy là sẵn sàng vận hành liên tục.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="#" className="mc-btn-primary-lg mc-mono text-[12px] uppercase tracking-[0.28em] font-black">
                  ⬢ DEPLOY UNIT
                </Link>
                <Link href="#" className="mc-btn-outline-lg mc-mono text-[12px] uppercase tracking-[0.28em] font-black">
                  / SPEC SHEET
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-3 border-t-2 border-zinc-800 pt-8">
                {[
                  { l: "OUTPUT", v: "1.2", u: "kW" },
                  { l: "TORQUE", v: "5.8", u: "GHz" },
                  { l: "UPTIME", v: "99.99", u: "%" },
                ].map((s) => (
                  <div key={s.l} className="mc-stat relative border-2 border-zinc-800 bg-zinc-900 p-4">
                    <span className="mc-rivet mc-rivet-tl" />
                    <span className="mc-rivet mc-rivet-tr" />
                    <p className="mc-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">{s.l}</p>
                    <p className="mt-1 text-[28px] font-black leading-none text-zinc-100 sm:text-[32px]">
                      {s.v}<span className="ml-1 text-[14px] text-orange-500">{s.u}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="mc-card-frame relative aspect-[4/5] overflow-hidden">
                <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
                <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

                <div className={`absolute inset-2 bg-gradient-to-br ${mockProducts[0].imageHue}`} />
                <div className="mc-hex pointer-events-none absolute inset-2 opacity-30 mix-blend-overlay" />
                <div className="absolute inset-2 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                <div className="absolute inset-2 flex flex-col justify-between p-5">
                  <div className="flex items-start justify-between">
                    <div className="mc-mono space-y-1 text-[10px] uppercase tracking-[0.3em] text-zinc-200">
                      <p><span className="text-orange-500">SN/</span> 0426-09A</p>
                      <p><span className="text-orange-500">CL/</span> SUPER-HEAVY</p>
                      <p><span className="text-orange-500">PWR/</span> 1.2KW · 24V</p>
                    </div>
                    <span className="mc-tag-warning mc-mono text-[10px] uppercase tracking-[0.28em] font-black">{mockProducts[0].badge}</span>
                  </div>

                  {/* gauge */}
                  <div className="my-4 flex items-end gap-3">
                    <div className="mc-gauge">
                      <svg viewBox="0 0 100 100" className="h-20 w-20">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                        <circle
                          cx="50" cy="50" r="42"
                          fill="none" stroke="#f97316" strokeWidth="6"
                          strokeLinecap="square"
                          strokeDasharray="264"
                          strokeDashoffset="60"
                          transform="rotate(-90 50 50)"
                        />
                        <text x="50" y="46" textAnchor="middle" className="mc-mono fill-zinc-100" fontSize="20" fontWeight="900">87</text>
                        <text x="50" y="62" textAnchor="middle" className="mc-mono fill-orange-400" fontSize="9">PCT</text>
                      </svg>
                    </div>
                    <div className="mc-mono space-y-1 text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                      <p>EFFICIENCY · <span className="text-orange-400">87%</span></p>
                      <p>THERMAL · <span className="text-orange-400">62°C</span></p>
                      <p>FAN · <span className="text-orange-400">2400RPM</span></p>
                    </div>
                  </div>

                  <div className="border-t-2 border-orange-500/60 pt-3">
                    <p className="mc-mono text-[10px] uppercase tracking-[0.32em] text-orange-500">⬢ DOSSIER · UNIT 0426</p>
                    <p className="mt-2 text-[22px] font-black uppercase leading-tight tracking-tight text-zinc-100 sm:text-[26px]">
                      {mockProducts[0].name}
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="mc-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">UNIT COST</p>
                        <p className="mc-mono text-[16px] font-black text-orange-400">{formatVnd(mockProducts[0].price)}</p>
                      </div>
                      <span className="mc-btn-primary mc-mono text-[10px] uppercase tracking-[0.28em] font-black">⬢ ORDER</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HAZARD DIVIDER */}
      <div className="mc-hazard h-2" />

      {/* CATEGORIES */}
      <section className="relative bg-zinc-900 py-20">
        <div className="mc-hex pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <header className="mb-10 flex items-end justify-between gap-4 border-b-2 border-zinc-800 pb-4">
            <div>
              <p className="mc-mono text-[10px] uppercase tracking-[0.4em] text-orange-500">⬢ 02 · COMPONENT BAY</p>
              <h2 className="mc-h1 mt-3 text-[34px] font-black uppercase leading-[1.05] tracking-[-0.03em] text-zinc-100 sm:text-[48px]">
                MODULES BY CLASS<span className="text-orange-500">.</span>
              </h2>
            </div>
            <Link href="#" className="mc-btn-outline-lg hidden mc-mono text-[10px] uppercase tracking-[0.3em] font-black sm:inline-flex">
              / FULL CATALOG
            </Link>
          </header>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {mockCategories.map((c, i) => (
              <li key={c.id} className="mc-cat group relative aspect-square overflow-hidden bg-zinc-950">
                <span className="mc-rivet mc-rivet-tl" />
                <span className="mc-rivet mc-rivet-tr" />
                <span className="mc-rivet mc-rivet-bl" />
                <span className="mc-rivet mc-rivet-br" />

                <div className={`absolute inset-1 bg-gradient-to-br ${c.hue}`} />
                <div className="mc-hex pointer-events-none absolute inset-1 opacity-30 mix-blend-overlay" />
                <div className="absolute inset-1 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

                <div className="absolute inset-1 flex flex-col justify-between p-3">
                  <div className="mc-mono flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-zinc-200">
                    <span>MOD/{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-orange-400">{c.glyph}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-black uppercase leading-tight text-zinc-100">{c.name}</p>
                    <p className="mc-mono mt-1 text-[9px] uppercase tracking-[0.25em] text-orange-400">
                      [{c.count.toString().padStart(3, "0")}] units ⬢
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="relative border-t-2 border-orange-500/40 bg-zinc-950 py-20">
        <div className="mc-hex pointer-events-none absolute inset-0 opacity-20" />
        <span className="pointer-events-none absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-orange-500/20 blur-[120px]" />

        <div className="relative mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-zinc-800 pb-4">
            <div>
              <p className="mc-mono text-[10px] uppercase tracking-[0.4em] text-orange-500">⬢ 03 · PRODUCTION LINE</p>
              <h2 className="mc-h1 mt-3 text-[34px] font-black uppercase leading-[1.05] tracking-[-0.03em] text-zinc-100 sm:text-[48px]">
                FRESH OFF THE FLOOR<span className="text-orange-500">.</span>
              </h2>
            </div>
            <div className="mc-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
              {["ALL", "RIG", "GPU", "GEAR"].map((t, i) => (
                <button key={t} className={i === 0 ? "mc-tab-active" : "mc-tab"}>{t}</button>
              ))}
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockProducts.slice(1, 7).map((p, i) => (
              <ProductCard key={p.id} p={p} index={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* HAZARD DIVIDER */}
      <div className="mc-hazard h-2" />

      {/* MANIFESTO */}
      <section className="relative overflow-hidden bg-zinc-900 py-24">
        <div className="mc-hex pointer-events-none absolute inset-0 opacity-25" />
        <span className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-orange-500/15 blur-[140px]" />

        <div className="relative mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <p className="mc-mono text-[10px] uppercase tracking-[0.4em] text-orange-500">⬢ 04 · ENGINEERING DOCTRINE</p>
          <h2 className="mc-h1 mt-4 max-w-3xl text-[42px] font-black uppercase leading-[0.95] tracking-[-0.04em] text-zinc-100 sm:text-[72px]">
            WE BUILD MACHINES<br />
            THAT <span className="text-orange-500">RUN COLD</span>.
          </h2>
          <div className="mt-14 grid gap-6 border-t-2 border-zinc-800 pt-12 sm:grid-cols-3">
            {[
              { k: "01", t: "RIVETED·LOCKED", d: "Mỗi rig kẹp chặt bằng 24 đinh tán hex chống rung. Không xê dịch trong vận chuyển." },
              { k: "02", t: "BURN·IN 72H", d: "Stress test ở 110% công suất, 72 giờ liên tục. Chỉ rời nhà máy khi 100% pass." },
              { k: "03", t: "FIELD·SUPPORT", d: "Engineer hỗ trợ tại xưởng, không tổng đài. Replacement trong 48h nếu lỗi phần cứng." },
            ].map((s) => (
              <div key={s.k} className="mc-stat-block relative border-2 border-zinc-800 bg-zinc-950 p-5">
                <span className="mc-rivet mc-rivet-tl" />
                <span className="mc-rivet mc-rivet-tr" />
                <span className="mc-rivet mc-rivet-bl" />
                <span className="mc-rivet mc-rivet-br" />
                <p className="mc-mono text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">⬢ {s.k} · {s.t}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t-2 border-orange-500/40 bg-zinc-950 py-16">
        <div className="mc-hex pointer-events-none absolute inset-0 opacity-15" />
        <div className="relative mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
          <div className="grid gap-10 border-b-2 border-zinc-800 pb-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="mc-mono text-[10px] uppercase tracking-[0.4em] text-orange-500">⬢ DISPATCH BAY</p>
              <h3 className="mc-h1 mt-4 text-[36px] font-black uppercase leading-[0.95] tracking-[-0.04em] text-zinc-100 sm:text-[54px]">
                FACTORY DISPATCH<span className="text-orange-500">.</span>
              </h3>
              <p className="mt-4 max-w-md text-[13px] text-zinc-400">
                Nhận build report, leak công nghệ và lịch xuất xưởng hàng tuần.
              </p>
              <form className="mt-6 flex max-w-md gap-0 border-2 border-zinc-700 bg-zinc-900 transition focus-within:border-orange-500">
                <input
                  type="email"
                  placeholder="OPERATOR@gatecat.heavy"
                  className="mc-mono min-w-0 flex-1 bg-transparent px-3 py-3 text-[12px] uppercase tracking-[0.15em] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
                <button className="mc-btn-primary mc-mono text-[10px] uppercase tracking-[0.28em] font-black">⬢ ENLIST</button>
              </form>
            </div>
            <div className="grid grid-cols-3 gap-6 lg:col-span-6">
              {[
                { t: "Bay", l: ["Chassis", "Power", "Optics", "Modules"] },
                { t: "Service", l: ["Bảo hành", "Trả góp", "Vận chuyển", "Manual"] },
                { t: "Plant", l: ["Về Gatecat", "Discord", "Tuyển dụng", "Liên hệ"] },
              ].map((s) => (
                <div key={s.t}>
                  <h4 className="mc-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">⬢ {s.t}</h4>
                  <ul className="mt-4 space-y-2.5">
                    {s.l.map((it) => (
                      <li key={it}><a href="#" className="mc-mono text-[11px] uppercase tracking-[0.18em] font-bold text-zinc-400 transition hover:text-orange-400">{it}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 pt-10 sm:flex-row sm:items-end">
            <div>
              <p className="mc-h1 text-[44px] font-black uppercase leading-none tracking-[-0.04em] text-zinc-100 sm:text-[64px]">
                GATECAT<span className="text-orange-500">/</span>MCH
              </p>
              <p className="mc-mono mt-3 text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                ⬢ HEAVY INDUSTRIES · ISO 9001 · MADE IN VN
              </p>
            </div>
            <div className="mc-mono text-right text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              <p>© 2026 · PLANT 01</p>
              <p className="mt-1">SN · GC·MCH·26</p>
            </div>
          </div>
        </div>
        <div className="mc-hazard mt-12 h-2" />
      </footer>
    </div>
  );
}

function ProductCard({ p, index }: { p: typeof mockProducts[number]; index: number }) {
  return (
    <Link href="#" className="mc-card group relative overflow-hidden bg-zinc-900 transition">
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <span className="mc-rivet mc-rivet-bl" />
      <span className="mc-rivet mc-rivet-br" />

      <div className="relative m-2 aspect-[4/3] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${p.imageHue}`} />
        <div className="mc-hex pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />

        <div className="mc-mono absolute left-3 top-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-100">
          <span className="text-orange-500">⬢</span>
          <span>SN/{String(index).padStart(2, "0")} · {p.category}</span>
        </div>
        {p.badge && (
          <span className="mc-tag-warning absolute right-3 top-3 mc-mono text-[10px] uppercase tracking-[0.28em] font-black">{p.badge}</span>
        )}
        <span className="mc-mono absolute bottom-3 left-3 border border-orange-500/50 bg-zinc-950/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.28em] font-bold text-orange-400 backdrop-blur">
          [{p.tag.toUpperCase()}]
        </span>
      </div>

      <div className="border-t-2 border-zinc-800 p-4">
        <p className="mc-mono text-[14px] font-black uppercase tracking-[0.04em] text-zinc-100">{p.name}</p>
        <p className="mc-mono mt-2 line-clamp-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">⬢ {p.spec}</p>
        <div className="mt-4 flex items-end justify-between border-t-2 border-zinc-800 pt-3">
          <div>
            <p className="mc-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">UNIT COST</p>
            <p className="mc-mono text-[15px] font-black text-orange-400">{formatVnd(p.price)}</p>
            {p.oldPrice && (
              <p className="mc-mono text-[10px] text-zinc-600 line-through">{formatVnd(p.oldPrice)}</p>
            )}
          </div>
          <span className="mc-btn-outline mc-mono text-[10px] uppercase tracking-[0.28em] font-black">⬢ ORDER</span>
        </div>
      </div>
    </Link>
  );
}

const cssBlock = `
.mc-root { background: #09090b; font-family: ui-sans-serif, system-ui, sans-serif; }
.mc-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.mc-h1 { font-family: "Inter", ui-sans-serif, system-ui, sans-serif; }

@keyframes mc-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
@keyframes mc-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.mc-hazard {
  background: repeating-linear-gradient(
    -45deg,
    #f97316 0, #f97316 14px,
    #18181b 14px, #18181b 28px
  );
}

.mc-hex {
  background-image:
    radial-gradient(circle at 50% 0%, rgba(249,115,22,0.05) 8px, transparent 9px),
    radial-gradient(circle at 50% 100%, rgba(249,115,22,0.05) 8px, transparent 9px),
    linear-gradient(60deg, transparent 49%, rgba(249,115,22,0.08) 49%, rgba(249,115,22,0.08) 51%, transparent 51%),
    linear-gradient(-60deg, transparent 49%, rgba(249,115,22,0.08) 49%, rgba(249,115,22,0.08) 51%, transparent 51%);
  background-size: 48px 56px;
}

.mc-plate {
  background: linear-gradient(145deg, #3f3f46, #18181b);
  border: 2px solid #52525b;
  position: relative;
}

.mc-rivet {
  position: absolute;
  width: 6px; height: 6px;
  background: radial-gradient(circle at 35% 35%, #71717a, #18181b);
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.5);
  z-index: 5;
}
.mc-rivet-lg { width: 8px; height: 8px; }
.mc-rivet-tl { left: 4px; top: 4px; }
.mc-rivet-tr { right: 4px; top: 4px; }
.mc-rivet-bl { left: 4px; bottom: 4px; }
.mc-rivet-br { right: 4px; bottom: 4px; }

.mc-navlink {
  padding: 0.55rem 0.85rem;
  color: rgba(244,244,245,0.7);
  border: 1px solid transparent;
  transition: all 200ms;
}
.mc-navlink:hover {
  color: #fb923c;
  background: #18181b;
  border-color: #f97316;
}

.mc-btn-primary, .mc-btn-primary-lg {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: #f97316; color: #09090b;
  padding: 0.6rem 1rem;
  border: 2px solid #f97316;
  box-shadow: 4px 4px 0 #18181b;
  transition: all 150ms;
}
.mc-btn-primary-lg { padding: 0.85rem 1.4rem; }
.mc-btn-primary:hover, .mc-btn-primary-lg:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #18181b;
}

.mc-btn-outline, .mc-btn-outline-lg {
  display: inline-flex; align-items: center; gap: 0.4rem;
  border: 2px solid #52525b; color: #f4f4f5;
  padding: 0.55rem 0.95rem;
  transition: all 150ms;
}
.mc-btn-outline-lg { padding: 0.8rem 1.35rem; }
.mc-btn-outline:hover, .mc-btn-outline-lg:hover {
  border-color: #f97316; color: #fb923c;
  background: rgba(249,115,22,0.06);
}

.mc-tag-warning {
  display: inline-flex; align-items: center; gap: 0.3rem;
  background: #eab308; color: #18181b;
  padding: 0.25rem 0.55rem;
  border: 2px solid #18181b;
  box-shadow: 2px 2px 0 #18181b;
}

.mc-stroke-orange {
  -webkit-text-stroke: 2px #f97316; color: transparent;
  text-shadow: 4px 4px 0 rgba(234,179,8,0.4);
}

.mc-card-frame {
  background: #18181b;
  border: 2px solid #52525b;
  position: relative;
}

.mc-cat {
  border: 2px solid #27272a;
  transition: border-color 150ms, transform 150ms;
}
.mc-cat:hover { border-color: #f97316; transform: translate(-2px, -2px); }

.mc-card {
  border: 2px solid #27272a;
  transition: border-color 150ms, transform 150ms, box-shadow 150ms;
}
.mc-card:hover {
  border-color: #f97316;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #18181b;
}

.mc-tab, .mc-tab-active {
  padding: 0.4rem 0.8rem;
  font-weight: 700; letter-spacing: 0.22em;
  border: 2px solid transparent;
  transition: all 150ms;
}
.mc-tab { color: #71717a; border-color: #3f3f46; }
.mc-tab:hover { color: #f4f4f5; border-color: #52525b; }
.mc-tab-active { background: #f97316; color: #18181b; border-color: #f97316; }
`;
