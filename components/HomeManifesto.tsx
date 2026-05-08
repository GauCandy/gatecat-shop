import Link from "next/link";

const points = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      </svg>
    ),
    title: "Chất lượng đảm bảo",
    desc: "Mỗi sản phẩm đều được kiểm tra kỹ lưỡng trước khi giao đến tay khách hàng. Cam kết hàng chính hãng 100%.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Giao hàng nhanh chóng",
    desc: "Hỗ trợ giao hàng toàn quốc. Đơn hàng nội thành được xử lý và giao trong vòng 24 giờ.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Hỗ trợ tận tâm",
    desc: "Đội ngũ tư vấn sẵn sàng hỗ trợ bạn. Bảo hành nhanh chóng, đổi trả linh hoạt trong 7 ngày.",
  },
];

export function HomeManifesto() {
  return (
    <section className="relative overflow-hidden bg-zinc-900 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent" aria-hidden />

      <div className="relative mx-auto w-full px-4 py-16 sm:px-6 lg:w-2/3 lg:px-0 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-orange-500">
              Tại sao chọn chúng tôi
            </p>
            <h2 className="mt-3 text-[32px] font-bold leading-tight tracking-tight sm:text-[44px] lg:text-[52px]">
              Mua sắm an tâm,{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                chất lượng hàng đầu
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-[15px] leading-7 text-zinc-400">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với sản phẩm
              chất lượng, giá cả hợp lý và dịch vụ chăm sóc khách hàng tận tâm.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-[13px] font-bold text-zinc-950 shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
            >
              Tìm hiểu thêm
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        <ul className="mt-14 grid gap-4 border-t border-zinc-800 pt-10 sm:grid-cols-3 sm:gap-6">
          {points.map((p) => (
            <li
              key={p.title}
              className="rounded-xl bg-zinc-950 p-6 ring-1 ring-zinc-800 transition hover:ring-orange-500/30"
            >
              <div className="mb-4 inline-flex rounded-lg bg-orange-500/10 p-2.5 text-orange-400">
                {p.icon}
              </div>
              <h3 className="text-[15px] font-bold text-zinc-100">
                {p.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-400">{p.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
