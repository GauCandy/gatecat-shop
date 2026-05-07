import Link from "next/link";

const points = [
  {
    k: "RIVETED·LOCKED",
    v: "Mỗi rig kẹp chặt bằng đinh tán hex chống rung. Không xê dịch trong vận chuyển.",
  },
  {
    k: "BURN·IN 72H",
    v: "Stress test ở 110% công suất, 72 giờ liên tục. Chỉ rời nhà máy khi 100% pass.",
  },
  {
    k: "FIELD·SUPPORT",
    v: "Engineer hỗ trợ tại xưởng — không tổng đài đọc kịch bản. Replacement trong 48h.",
  },
];

export function HomeManifesto() {
  return (
    <section className="relative overflow-hidden border-t-2 border-orange-500/40 bg-zinc-900 text-zinc-100">
      <div aria-hidden className="mc-hex pointer-events-none absolute inset-0 opacity-25" />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-orange-500/15 blur-[140px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-zinc-100/5 blur-3xl"
      />

      <div className="relative mx-auto w-full px-4 py-16 sm:px-6 lg:w-2/3 lg:px-0 lg:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.4em] text-orange-500">
              ⬢ 04 · ENGINEERING DOCTRINE
            </p>
            <h2 className="mt-5 text-[40px] font-black uppercase leading-[0.98] tracking-[-0.035em] sm:text-[60px] lg:text-[72px]">
              WE BUILD MACHINES
              <br />
              THAT <span className="mc-stroke-orange">RUN COLD</span>.
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-[14px] leading-7 text-zinc-400">
              Một chiếc máy tốt là chiếc máy hợp với bạn — không phải chiếc máy
              đắt nhất hay nhiều RGB nhất. Gatecat Heavy Industries tồn tại để
              rút ngắn quãng đường giữa nhu cầu thật và cấu hình đúng. Mọi đơn vị
              đều được lắp ráp bằng tay và stress-test 72h trước khi giao.
            </p>
            <Link href="/about" className="mc-btn-outline mc-btn-outline-lg mt-7">
              / VỀ NHÀ MÁY →
            </Link>
          </div>
        </div>

        <ul className="mt-14 grid gap-4 border-t-2 border-zinc-800 pt-10 sm:grid-cols-3 sm:gap-6">
          {points.map((p, i) => (
            <li
              key={p.k}
              className="relative border-2 border-zinc-800 bg-zinc-950 p-5"
            >
              <span className="mc-rivet mc-rivet-tl" />
              <span className="mc-rivet mc-rivet-tr" />
              <span className="mc-rivet mc-rivet-bl" />
              <span className="mc-rivet mc-rivet-br" />
              <span className="mc-mono text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">
                ⬢ {String(i + 1).padStart(2, "0")} · {p.k}
              </span>
              <p className="mt-4 text-[14px] leading-relaxed text-zinc-400">{p.v}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
