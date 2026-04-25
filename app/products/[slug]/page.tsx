import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductReviewList } from "@/components/ProductReviewList";
import { getProductBySlug } from "@/lib/products";
import { listReviewsForProduct, getProductRatingStats } from "@/lib/reviews";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, stats] = await Promise.all([
    listReviewsForProduct(product.id),
    getProductRatingStats(product.id),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:w-2/3 lg:px-0">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--color-text-dim)]">
            <Link href="/" className="hover:text-[var(--color-text)]">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[var(--color-text)]">
              Sản phẩm
            </Link>
            {product.categories[0] && (
              <>
                <span>/</span>
                <Link
                  href={`/category/${product.categories[0].slug}`}
                  className="hover:text-[var(--color-text)]"
                >
                  {product.categories[0].name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-[var(--color-text)]">{product.name}</span>
          </nav>

          <ProductDetailClient product={product} />

          <ProductReviewList
            reviews={reviews}
            average={stats.average}
            count={stats.count}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
