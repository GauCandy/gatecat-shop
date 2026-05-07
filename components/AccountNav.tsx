"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/account/info", label: "OPERATOR INFO", desc: "Thông tin tài khoản", glyph: "01" },
  { href: "/account/addresses", label: "DEPLOY POINT", desc: "Sổ địa chỉ", glyph: "02" },
];

export function AccountNav({
  userName,
  userEmail,
  avatarUrl,
}: {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-[5.5rem] h-fit">
      <div className="relative border-2 border-zinc-700 bg-zinc-900">
        <span className="mc-rivet mc-rivet-tl" />
        <span className="mc-rivet mc-rivet-tr" />
        <span className="mc-rivet mc-rivet-bl" />
        <span className="mc-rivet mc-rivet-br" />

        <div className="border-b-2 border-zinc-800 bg-zinc-950 p-4">
          <p className="mc-mono mb-3 text-[9px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ OPERATOR PROFILE
          </p>
          <div className="flex items-center gap-3">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden border-2 border-zinc-700 bg-orange-500 text-[15px] font-black text-zinc-950">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-black uppercase tracking-[0.04em] text-zinc-100">
                {userName}
              </p>
              <p className="mc-mono mt-1 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col">
          {NAV.map((n, idx) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`mc-mono relative px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition ${
                  idx > 0 ? "border-t-2 border-zinc-800" : ""
                } ${
                  active
                    ? "bg-orange-500/10 text-orange-400"
                    : "text-zinc-400 hover:bg-zinc-950 hover:text-zinc-100"
                }`}
              >
                {active && (
                  <span aria-hidden className="absolute right-0 top-0 h-full w-1 bg-orange-500" />
                )}
                <span className="flex items-center gap-3">
                  <span className={active ? "text-orange-500" : "text-zinc-600"}>
                    ⬢ {n.glyph}
                  </span>
                  <span>
                    <span className="block">{n.label}</span>
                    <span className={`mt-0.5 block text-[10px] font-normal normal-case tracking-[0.04em] ${active ? "text-orange-400/70" : "text-zinc-500"}`}>
                      {n.desc}
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
