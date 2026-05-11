import { notFound } from "next/navigation";
import { Fragment, Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductsBrowser } from "@/components/ProductsBrowser";
import { listProducts } from "@/lib/products";
import { listCategories, getCategoryBySlug } from "@/lib/categories";
import { getCategoryVisualUrl } from "@/lib/home-assets";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Gatecat Shop`,
    description: `Khám phá sản phẩm trong danh mục ${category.name}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const [category, products, categories] = await Promise.all([
    getCategoryBySlug(slug),
    listProducts(),
    listCategories(),
  ]);

  if (!category) notFound();

  const byId = new Map(categories.map((c) => [c.id, c]));
  const ancestors: { name: string; slug: string }[] = [];
  let cur = category.parentId ? byId.get(category.parentId) : undefined;
  while (cur) {
    ancestors.unshift({ name: cur.name, slug: cur.slug });
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }

  const imageUrl = getCategoryVisualUrl(category);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Category hero */}
        <div className="relative overflow-hidden border-b-2 border-zinc-800 bg-zinc-950">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-[0.07]"
            />
          )}
          {imageUrl && (
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"
            />
          )}
          <div className="relative mx-auto w-full px-4 py-6 sm:px-6 lg:w-2/3 lg:px-0">
            <nav className="mc-mono mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
              <Link href="/" className="transition hover:text-orange-400">
                Trang chủ
              </Link>
              <span className="text-zinc-700">/</span>
              <Link href="/products" className="transition hover:text-orange-400">
                Sản phẩm
              </Link>
              {ancestors.map((a) => (
                <Fragment key={a.slug}>
                  <span className="text-zinc-700">/</span>
                  <Link
                    href={`/category/${a.slug}`}
                    className="transition hover:text-orange-400"
                  >
                    {a.name}
                  </Link>
                </Fragment>
              ))}
              <span className="text-zinc-700">/</span>
              <span className="font-black text-orange-400">{category.name}</span>
            </nav>

            <h1 className="text-[26px] font-black uppercase leading-tight tracking-tight text-zinc-100 sm:text-[34px]">
              {category.name}
              <span className="text-orange-500">.</span>
            </h1>
          </div>
        </div>

        <Suspense fallback={null}>
          <ProductsBrowser
            products={products}
            categories={categories}
            lockedCategorySlug={category.slug}
            title={category.name}
            subtitle="Lọc theo danh mục con, tên hoặc khoảng giá."
            hideTitle
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
