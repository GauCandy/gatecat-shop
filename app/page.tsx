import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Popup } from "@/components/Popup";
import { Banner } from "@/components/Banner";
import { HomeMarquee } from "@/components/HomeMarquee";
import { HomeFeaturedCategories } from "@/components/HomeFeaturedCategories";
import { HomeFeaturedProducts } from "@/components/HomeFeaturedProducts";
import { HomeManifesto } from "@/components/HomeManifesto";

export const dynamic = "force-dynamic";

export default function HomePage() {
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
    </>
  );
}
