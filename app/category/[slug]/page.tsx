import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductsBrowser } from "@/components/ProductsBrowser";
import { listProducts } from "@/lib/products";
import { getCategoryBySlug, listCategories } from "@/lib/categories";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products, categories] = await Promise.all([
    getCategoryBySlug(slug),
    listProducts(),
    listCategories(),
  ]);
  if (!category) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={null}>
          <ProductsBrowser
            products={products}
            categories={categories}
            lockedCategorySlug={slug}
            title={category.name}
            subtitle="Lọc thêm trong danh mục này theo tên hoặc khoảng giá."
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
