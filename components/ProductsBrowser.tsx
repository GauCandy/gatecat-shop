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
    <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:w-2/3 lg:px-0">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-text)] sm:text-[26px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 text-[13px] text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-4 w-4"
            >
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            Bộ lọc{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-full border border-[var(--color-border)] bg-white px-3 text-[13px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            <option value="default">Sắp xếp: Mặc định</option>
            <option value="price-asc">Giá thấp → cao</option>
            <option value="price-desc">Giá cao → thấp</option>
            <option value="name-asc">Tên A → Z</option>
          </select>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside
          className={`${
            mobileOpen ? "block" : "hidden"
          } lg:block lg:self-start lg:sticky lg:top-[4.75rem]`}
        >
          <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border-strong)] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-[var(--color-text)]">
                Bộ lọc
              </h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[12px] text-[var(--color-accent)] hover:underline"
                >
                  Xoá tất cả
                </button>
              )}
            </div>

            <FilterBlock label="Khuyến mãi & tồn kho">
              <div className="flex flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--color-text)]">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                  Chỉ hiện còn hàng
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--color-text)]">
                  <input
                    type="checkbox"
                    checked={onlySale}
                    onChange={(e) => setOnlySale(e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                  Đang giảm giá
                </label>
              </div>
            </FilterBlock>

            <FilterBlock label="Giá (₫)">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={minPrice ? formatVnd(Number(minPrice)) : ""}
                  onChange={(e) => setMinPrice(parseDigits(e.target.value))}
                  placeholder="Từ"
                  className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-[13px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxPrice ? formatVnd(Number(maxPrice)) : ""}
                  onChange={(e) => setMaxPrice(parseDigits(e.target.value))}
                  placeholder="Đến"
                  className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-[13px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  { label: "Dưới 1tr", max: 1_000_000 },
                  { label: "1–5tr", min: 1_000_000, max: 5_000_000 },
                  { label: "5–15tr", min: 5_000_000, max: 15_000_000 },
                  { label: "Trên 15tr", min: 15_000_000 },
                ].map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => {
                      setMinPrice(r.min ? String(r.min) : "");
                      setMaxPrice(r.max ? String(r.max) : "");
                    }}
                    className="rounded-full border border-[var(--color-border)] bg-white px-2.5 py-0.5 text-[11px] text-[var(--color-text-dim)] transition hover:border-[var(--color-text)]/30 hover:text-[var(--color-text)]"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </FilterBlock>

            {catRows.length > 0 && (
              <FilterBlock
                label={
                  lockedCategory
                    ? `Danh mục con của ${lockedCategory.name}`
                    : "Danh mục"
                }
              >
                <div className="max-h-64 overflow-y-auto pr-1">
                  <ul className="flex flex-col">
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
                              className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[13px] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                              style={{
                                paddingLeft: `${(depth - extraIndent) * 12 + 4}px`,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCat(category.id)}
                                className="h-4 w-4 accent-[var(--color-accent)]"
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
        </aside>

        <section>
          <div className="mb-3 flex items-center justify-between text-[12px] text-[var(--color-text-dim)]">
            <span>
              {sorted.length} / {products.length} sản phẩm
            </span>
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-white px-6 py-16 text-center">
              <p className="text-[14px] font-medium text-[var(--color-text)]">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
                Thử bỏ bớt bộ lọc hoặc thay đổi từ khoá.
              </p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 inline-flex items-center rounded-full border border-[var(--color-text)] bg-white px-4 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)]"
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
    <div className="flex flex-col gap-2">
      <p className="text-[12px] font-medium text-[var(--color-text-dim)]">
        {label}
      </p>
      {children}
    </div>
  );
}
