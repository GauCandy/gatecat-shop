"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products";
import type { Category } from "@/lib/categories-types";
import {
  collectDescendantIds,
  sortByTree,
} from "@/lib/category-tree";
import { ProductCard } from "./ProductCard";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(n)));

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function parseDigits(s: string): string {
  return s.replace(/\D+/g, "");
}

function variantMinMax(p: Product): { min: number; max: number } | null {
  if (p.variants.length === 0) return null;
  const prices = p.variants.map((v) => v.salePrice);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

type SortKey = "default" | "price-asc" | "price-desc" | "name-asc";

export function ProductsBrowser({
  products,
  categories,
  lockedCategorySlug = null,
  title,
  subtitle,
}: {
  products: Product[];
  categories: Category[];
  lockedCategorySlug?: string | null;
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const lockedCategory = useMemo(
    () =>
      lockedCategorySlug
        ? categories.find((c) => c.slug === lockedCategorySlug) ?? null
        : null,
    [categories, lockedCategorySlug]
  );

  const lockedSubtree = useMemo(() => {
    if (!lockedCategory) return null;
    const ids = collectDescendantIds(categories, lockedCategory.id);
    ids.add(lockedCategory.id);
    return ids;
  }, [categories, lockedCategory]);

  const urlQ = sp.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  useEffect(() => {
    setQ((prev) => (prev === urlQ ? prev : urlQ));
  }, [urlQ]);
  const [minPrice, setMinPrice] = useState(sp.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("max") ?? "");
  const [sort, setSort] = useState<SortKey>((sp.get("sort") as SortKey) ?? "default");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(() => {
    const raw = sp.get("cat");
    return new Set(raw ? raw.split(",").filter(Boolean) : []);
  });
  const [onlyInStock, setOnlyInStock] = useState(sp.get("instock") === "1");
  const [onlySale, setOnlySale] = useState(sp.get("sale") === "1");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    if (sort !== "default") params.set("sort", sort);
    if (selectedCats.size > 0) params.set("cat", Array.from(selectedCats).join(","));
    if (onlyInStock) params.set("instock", "1");
    if (onlySale) params.set("sale", "1");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [q, minPrice, maxPrice, sort, selectedCats, onlyInStock, onlySale, router]);

  const catRows = useMemo(() => {
    const rows = sortByTree(categories);
    if (!lockedSubtree) return rows;
    return rows.filter((r) => lockedSubtree.has(r.category.id));
  }, [categories, lockedSubtree]);

  const selectedCatsExpanded = useMemo(() => {
    if (selectedCats.size === 0) return null;
    const ids = new Set<string>();
    for (const id of selectedCats) {
      ids.add(id);
      for (const d of collectDescendantIds(categories, id)) ids.add(d);
    }
    return ids;
  }, [categories, selectedCats]);

  const filtered = useMemo(() => {
    const nq = q.trim() ? normalize(q.trim()) : "";
    const minN = minPrice ? Number(minPrice) : null;
    const maxN = maxPrice ? Number(maxPrice) : null;

    return products.filter((p) => {
      if (lockedSubtree && !p.categories.some((c) => lockedSubtree.has(c.id))) {
        return false;
      }
      if (nq) {
        const hit =
          normalize(p.name).includes(nq) ||
          normalize(p.slug).includes(nq) ||
          p.categories.some((c) => normalize(c.name).includes(nq)) ||
          p.variants.some((v) => normalize(v.sku).includes(nq));
        if (!hit) return false;
      }
      if (selectedCatsExpanded) {
        if (!p.categories.some((c) => selectedCatsExpanded.has(c.id))) {
          return false;
        }
      }
      const range = variantMinMax(p);
      if (minN !== null || maxN !== null) {
        if (!range) return false;
        if (minN !== null && range.max < minN) return false;
        if (maxN !== null && range.min > maxN) return false;
      }
      if (onlyInStock && !p.variants.some((v) => v.stock > 0)) return false;
      if (onlySale && !p.variants.some((v) => v.listPrice > v.salePrice)) return false;
      return true;
    });
  }, [products, q, minPrice, maxPrice, lockedSubtree, selectedCatsExpanded, onlyInStock, onlySale]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    if (sort === "price-asc") {
      arr.sort((a, b) => {
        const ra = variantMinMax(a)?.min ?? Infinity;
        const rb = variantMinMax(b)?.min ?? Infinity;
        return ra - rb;
      });
    } else if (sort === "price-desc") {
      arr.sort((a, b) => {
        const ra = variantMinMax(a)?.max ?? -1;
        const rb = variantMinMax(b)?.max ?? -1;
        return rb - ra;
      });
    } else if (sort === "name-asc") {
      arr.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }
    return arr;
  }, [filtered, sort]);

  const toggleCat = (id: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAll = () => {
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setSort("default");
    setSelectedCats(new Set());
    setOnlyInStock(false);
    setOnlySale(false);
  };

  const activeCount =
    (q.trim() ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (onlySale ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (selectedCats.size > 0 ? 1 : 0);

  return (
    <div className="relative">
      <div className="relative mx-auto w-full px-4 py-8 sm:px-6 lg:w-2/3 lg:px-0">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-zinc-100 sm:text-[32px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-[14px] text-zinc-500">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-[13px] font-medium text-zinc-300 transition hover:border-zinc-600 lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="h-4 w-4"
              >
                <path d="M3 6h18M6 12h12M10 18h4" />
              </svg>
              Bộ lọc {activeCount > 0 ? `(${activeCount})` : ""}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-[13px] font-medium text-zinc-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name-asc">Tên A → Z</option>
            </select>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside
            className={`${
              mobileOpen ? "block" : "hidden"
            } lg:block lg:self-start lg:sticky lg:top-[5.5rem]`}
          >
            <div className="rounded-xl bg-zinc-900 p-5 ring-1 ring-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-[14px] font-bold text-zinc-200">
                  Bộ lọc
                </h2>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[12px] font-semibold text-orange-400 transition hover:text-orange-300"
                  >
                    Xoá tất cả ({activeCount})
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-6">
                {/* Stock & sale */}
                <FilterBlock label="Trạng thái">
                  <div className="flex flex-col gap-2.5">
                    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-zinc-300 hover:text-zinc-100">
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(e) => setOnlyInStock(e.target.checked)}
                        className="h-4 w-4 rounded accent-orange-500"
                      />
                      Còn hàng
                    </label>
                    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-zinc-300 hover:text-zinc-100">
                      <input
                        type="checkbox"
                        checked={onlySale}
                        onChange={(e) => setOnlySale(e.target.checked)}
                        className="h-4 w-4 rounded accent-orange-500"
                      />
                      Đang giảm giá
                    </label>
                  </div>
                </FilterBlock>

                {/* Price range */}
                <FilterBlock label="Khoảng giá (₫)">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={minPrice ? formatVnd(Number(minPrice)) : ""}
                      onChange={(e) => setMinPrice(parseDigits(e.target.value))}
                      placeholder="Từ"
                      className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={maxPrice ? formatVnd(Number(maxPrice)) : ""}
                      onChange={(e) => setMaxPrice(parseDigits(e.target.value))}
                      placeholder="Đến"
                      className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {[
                      { label: "< 1 triệu", max: 1_000_000 },
                      { label: "1-5 triệu", min: 1_000_000, max: 5_000_000 },
                      { label: "5-15 triệu", min: 5_000_000, max: 15_000_000 },
                      { label: "> 15 triệu", min: 15_000_000 },
                    ].map((r) => (
                      <button
                        key={r.label}
                        type="button"
                        onClick={() => {
                          setMinPrice(r.min ? String(r.min) : "");
                          setMaxPrice(r.max ? String(r.max) : "");
                        }}
                        className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-[12px] font-medium text-zinc-400 transition hover:border-orange-500/60 hover:text-orange-400"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </FilterBlock>

                {/* Category filter */}
                {catRows.length > 0 && (
                  <FilterBlock
                    label={
                      lockedCategory
                        ? `Danh mục con`
                        : "Danh mục"
                    }
                  >
                    <div className="max-h-64 overflow-y-auto pr-1">
                      <ul className="flex flex-col gap-0.5">
                        {catRows
                          .filter(
                            (r) =>
                              !lockedCategory || r.category.id !== lockedCategory.id
                          )
                          .map(({ category, depth }) => {
                            const checked = selectedCats.has(category.id);
                            const extraIndent = lockedCategory ? 1 : 0;
                            return (
                              <li key={category.id}>
                                <label
                                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
                                  style={{
                                    paddingLeft: `${(depth - extraIndent) * 14 + 8}px`,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleCat(category.id)}
                                    className="h-4 w-4 rounded accent-orange-500"
                                  />
                                  <span className="truncate">{category.name}</span>
                                </label>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  </FilterBlock>
                )}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <section>
            <div className="mb-4 flex items-center justify-between text-[13px] text-zinc-500">
              <span>
                Hiển thị <span className="font-semibold text-zinc-300">{sorted.length}</span> / {products.length} sản phẩm
              </span>
              {activeCount > 0 && (
                <span className="text-orange-400">{activeCount} bộ lọc đang áp dụng</span>
              )}
            </div>

            {sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 px-6 py-16 text-center">
                <p className="text-[16px] font-bold text-zinc-300">
                  Không tìm thấy sản phẩm
                </p>
                <p className="mt-2 text-[14px] text-zinc-500">
                  Thử bỏ bớt bộ lọc hoặc thay đổi từ khoá.
                </p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-[13px] font-medium text-zinc-300 transition hover:border-orange-500/60 hover:text-orange-400"
                  >
                    Xoá bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {sorted.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[12px] font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      {children}
    </div>
  );
}
