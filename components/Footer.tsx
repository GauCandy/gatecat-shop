import Link from "next/link";
import { getSiteSettings } from "@/lib/site";

const sections = [
  {
    title: "Sản phẩm",
    links: [
      { href: "/products", label: "Tất cả sản phẩm" },
      { href: "/products?sale=1", label: "Đang giảm giá" },
      { href: "/products?instock=1", label: "Hàng mới về" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { href: "/legal#terms", label: "Vận chuyển" },
      { href: "/legal#terms", label: "Đổi trả & Bảo hành" },
      { href: "/legal#terms", label: "Thanh toán" },
      { href: "/legal#terms", label: "Trả góp" },
    ],
  },
  {
    title: "Về chúng tôi",
    links: [
      { href: "/about", label: "Giới thiệu" },
      { href: "/legal", label: "Pháp lý" },
      { href: "mailto:support@gatecat.net", label: "Liên hệ" },
    ],
  },
];

export async function Footer() {
  const settings = await getSiteSettings();
  return (
    <footer className="relative mt-auto border-t border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="relative mx-auto w-full px-4 sm:px-6 lg:w-2/3 lg:px-0">
        {/* Newsletter + links */}
        <div className="grid gap-10 border-b border-zinc-800 py-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-orange-500">
              Đăng ký nhận tin
            </p>
            <h2 className="mt-3 text-[28px] font-bold leading-tight tracking-tight sm:text-[36px]">
              Không bỏ lỡ ưu đãi
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-zinc-400">
              Nhận thông tin sản phẩm mới, chương trình khuyến mãi và ưu đãi đặc biệt
              hàng tuần qua email.
            </p>

            <form className="mt-6 flex w-full max-w-md gap-0 overflow-hidden rounded-xl ring-1 ring-zinc-700 transition focus-within:ring-orange-500">
              <input
                type="email"
                required
                placeholder="Email của bạn"
                className="min-w-0 flex-1 bg-zinc-900 px-4 py-3 text-[14px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 bg-orange-500 px-5 py-3 text-[13px] font-bold text-zinc-950 transition hover:bg-orange-400"
              >
                Đăng ký
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-6 lg:col-span-5">
            {sections.map((s) => (
              <div key={s.title}>
                <h3 className="text-[12px] font-bold uppercase tracking-wide text-zinc-400">
                  {s.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {s.links.map((l) => (
                    <li key={`${s.title}-${l.label}`}>
                      <Link
                        href={l.href}
                        className="text-[13px] text-zinc-400 transition hover:text-orange-400"
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

        {/* Brand area */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-zinc-800 py-8 sm:flex-row sm:items-center">
          <Link href="/" className="block">
            {settings.logoUrl ? (
              <span className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logoUrl} alt={settings.siteName} className="h-10 w-auto object-contain" />
                <span className="text-[22px] font-bold tracking-tight">
                  {settings.siteName}
                </span>
              </span>
            ) : (
              <span className="text-[22px] font-bold tracking-tight">
                {settings.siteName}
              </span>
            )}
          </Link>
          <p className="max-w-sm text-[13px] leading-relaxed text-zinc-500">
            Cửa hàng trực tuyến uy tín — chất lượng là lời cam kết.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 py-5 sm:flex-row sm:items-center">
          <p className="text-[12px] text-zinc-500">
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
            <span className="mx-2 text-zinc-700">·</span>
            <span>
              Bản quyền bởi{" "}
              <span className="font-semibold text-orange-400">GauCandy</span>
            </span>
          </p>
          <div className="flex gap-5 text-[12px] text-zinc-500">
            <Link href="/legal" className="transition hover:text-orange-400">
              Pháp lý
            </Link>
            <Link href="mailto:support@gatecat.net" className="transition hover:text-orange-400">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
