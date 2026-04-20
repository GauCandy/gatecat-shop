import { Header } from "@/components/Header";
import { Banner } from "@/components/Banner";
import { CategoryStrip } from "@/components/CategoryStrip";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Banner />
        <CategoryStrip />
        <ProductGrid />
      </main>
      <Footer />
    </>
  );
}
