import { requireAdmin } from "@/lib/admin";
import { getSiteSettings, listBanners, listPopups } from "@/lib/site";
import { SiteManager } from "./SiteManager";

export const dynamic = "force-dynamic";

export default async function AdminSitePage() {
  await requireAdmin();
  const [settings, banners, popups] = await Promise.all([
    getSiteSettings(),
    listBanners(false),
    listPopups(false),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ ADMIN · 02 · SITE CONFIG
        </p>
        <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
          Quản lí giao diện<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Logo, banner trang chủ, popup quảng cáo.
        </p>
      </div>
      <SiteManager initialSettings={settings} initialBanners={banners} initialPopups={popups} />
    </div>
  );
}
