import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductsBrowser } from "@/components/ProductsBrowser";
import { listProducts } from "@/lib/products";
import { listCategories } from "@/lib/categories";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={null}>
          <ProductsBrowser
            products={products}
            categories={categories}
            title="Tất cả sản phẩm"
            subtitle="Lọc theo danh mục, tên hoặc khoảng giá."
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
