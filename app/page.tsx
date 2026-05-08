import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE } from "@/lib/session";
import { getSiteSettings } from "@/lib/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Popup } from "@/components/Popup";
import { Banner } from "@/components/Banner";
import { HomeMarquee } from "@/components/HomeMarquee";
import { HomeFeaturedCategories } from "@/components/HomeFeaturedCategories";
import { HomeFeaturedProducts } from "@/components/HomeFeaturedProducts";
import { HomeManifesto } from "@/components/HomeManifesto";
import { QuickEditFab } from "@/components/QuickEditFab";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const [user, settings] = await Promise.all([
    getSessionUser(token),
    getSiteSettings(),
  ]);

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <HomeMarquee />
      <Header />
      <main className="flex-1">
        <Banner />
        <HomeFeaturedCategories />
        <HomeManifesto />
        <HomeFeaturedProducts />
      </main>
      <Footer />
      <Popup />
      {isAdmin && (
        <QuickEditFab
          siteName={settings.siteName}
          logoUrl={settings.logoUrl}
          marqueeItems={settings.marqueeItems}
          heroBgUrl={settings.heroBgUrl}
          heroShowcaseLabel={settings.heroShowcaseLabel}
          heroShowcaseText={settings.heroShowcaseText}
          heroShowcaseImageUrl={settings.heroShowcaseImageUrl}
        />
      )}
    </>
  );
}
