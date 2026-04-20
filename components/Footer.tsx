import Link from "next/link";

const sections = [
  {
    title: "Mua sắm",
    links: [
      { href: "/laptops", label: "Laptop" },
      { href: "/desktops", label: "Desktop" },
      { href: "/components", label: "Linh kiện" },
      { href: "/peripherals", label: "Phụ kiện" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { href: "/support", label: "Trung tâm hỗ trợ" },
      { href: "/warranty", label: "Bảo hành" },
      { href: "/shipping", label: "Vận chuyển" },
      { href: "/returns", label: "Đổi trả" },
    ],
  },
  {
    title: "Về Gatecat",
    links: [
      { href: "/about", label: "Giới thiệu" },
      { href: "/stores", label: "Hệ thống cửa hàng" },
      { href: "/careers", label: "Tuyển dụng" },
      { href: "/contact", label: "Liên hệ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface-3)]">
      <div className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-2/3 lg:px-0">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-text)] text-[11px] font-semibold text-white">
                G
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                Gatecat
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] text-[var(--color-text-dim)]">
              Cửa hàng công nghệ uy tín — laptop, PC, linh kiện chính hãng, bảo
              hành toàn quốc.
            </p>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h3 className="text-[13px] font-semibold text-[var(--color-text)]">
                {s.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-[var(--color-text-dim)] transition hover:text-[var(--color-text)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[var(--color-border)] pt-6 text-[12px] text-[var(--color-text-dim)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Gatecat Shop. Bảo lưu mọi quyền.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-[var(--color-text)]">
              Chính sách riêng tư
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-text)]">
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
