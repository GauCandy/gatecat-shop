"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/categories";
import type { Product, ProductVariant } from "@/lib/products";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; product: Product };

const PAGE_SIZES = [10, 25, 50, 100] as const;

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(n)));

export function ProductManager({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [mode, setMode] = useState<Mode>({ kind: "create" });
  const [formNonce, setFormNonce] = useState(0);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const trimmed = query.trim();
  const isFiltered = trimmed.length > 0;

  const filtered = useMemo(() => {
    if (!isFiltered) return products;
    const q = normalize(trimmed);
    return products.filter((p) => {
      if (normalize(p.name).includes(q)) return true;
      if (normalize(p.slug).includes(q)) return true;
      if (p.categories.some((c) => normalize(c.name).includes(q))) return true;
      return p.variants.some((v) => normalize(v.sku).includes(q));
    });
  }, [products, isFiltered, trimmed]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageSlice = filtered.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [trimmed, pageSize]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const persistOrder = async (next: Product[]) => {
    const res = await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((p) => p.id) }),
    });
    if (!res.ok) alert("Không thể lưu thứ tự mới");
    router.refresh();
  };

  const handleReorderWithinPage = (fromVisible: number, toVisible: number) => {
    if (fromVisible === toVisible) return;
    const globalFrom = startIndex + fromVisible;
    const globalTo = startIndex + toVisible;
    const next = products.slice();
    const [moved] = next.splice(globalFrom, 1);
    next.splice(globalTo, 0, moved);
    setProducts(next);
    persistOrder(next);
  };

  const canDrag = !isFiltered;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <ProductList
        products={pageSlice}
        query={query}
        onQueryChange={setQuery}
        isFiltered={isFiltered}
        totalCount={products.length}
        totalFiltered={filtered.length}
        page={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        canDrag={canDrag}
        onEdit={(p) => setMode({ kind: "edit", product: p })}
        onDelete={async (p) => {
          if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
          const res = await fetch(`/api/admin/products/${p.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: "Lỗi" }));
            alert(error ?? "Không thể xoá sản phẩm");
            return;
          }
          setProducts((list) => list.filter((x) => x.id !== p.id));
          if (mode.kind === "edit" && mode.product.id === p.id) {
            setMode({ kind: "create" });
          }
          router.refresh();
        }}
        onReorder={handleReorderWithinPage}
      />

      <ProductForm
        mode={mode}
        categories={categories}
        resetKey={formNonce}
        onCancel={() => setMode({ kind: "create" })}
        onSaved={(saved) => {
          setProducts((list) => {
            const idx = list.findIndex((x) => x.id === saved.id);
            if (idx === -1) return [...list, saved];
            const next = list.slice();
            next[idx] = saved;
            return next;
          });
          setMode({ kind: "create" });
          setFormNonce((n) => n + 1);
          router.refresh();
        }}
      />
    </div>
  );
}

function DragHandle() {
  return (
    <svg
      viewBox="0 0 10 16"
      aria-hidden="true"
      className="h-4 w-2.5"
      fill="currentColor"
    >
      <circle cx="2" cy="3" r="1.2" />
      <circle cx="2" cy="8" r="1.2" />
      <circle cx="2" cy="13" r="1.2" />
      <circle cx="8" cy="3" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="8" cy="13" r="1.2" />
    </svg>
  );
}

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

function JumpInput({
  totalPages,
  onJump,
}: {
  totalPages: number;
  onJump: (p: number) => void;
}) {
  const [val, setVal] = useState("");
  const commit = () => {
    const n = Number.parseInt(val, 10);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) onJump(n);
    setVal("");
  };
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-zinc-400">
      <span>Đến trang</span>
      <input
        type="number"
        min={1}
        max={totalPages}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={String(totalPages)}
        className="h-7 w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 text-center text-[12px] text-zinc-100 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
      />
    </div>
  );
}

function Pager({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const disabledPrev = page <= 1;
  const disabledNext = page >= totalPages;
  const pages = buildPageList(page, totalPages);
  const btnBase =
    "min-w-[28px] rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[12px] font-medium text-zinc-300 transition hover:bg-zinc-950 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabledPrev}
        className={btnBase}
        aria-label="Trang trước"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`e-${i}`}
            className="px-1 text-[12px] text-zinc-500 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={
              p === page
                ? "min-w-[28px] rounded border border-orange-500 bg-orange-500 px-2 py-1 text-[12px] font-medium text-white"
                : btnBase
            }
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabledNext}
        className={btnBase}
        aria-label="Trang sau"
      >
        ›
      </button>
      {totalPages > 7 && (
        <JumpInput totalPages={totalPages} onJump={onPageChange} />
      )}
    </div>
  );
}

function ProductList({
  products,
  query,
  onQueryChange,
  isFiltered,
  totalCount,
  totalFiltered,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  canDrag,
  onEdit,
  onDelete,
  onReorder,
}: {
  products: Product[];
  query: string;
  onQueryChange: (q: string) => void;
  isFiltered: boolean;
  totalCount: number;
  totalFiltered: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  canDrag: boolean;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const dragYRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);

  // Auto-scroll logic: scroll page when dragging near viewport edges
  const EDGE_ZONE = 80; // px from edge to start scrolling
  const MAX_SPEED = 18; // max px per frame

  const startAutoScroll = () => {
    const tick = () => {
      const y = dragYRef.current;
      const vh = window.innerHeight;
      if (y < EDGE_ZONE) {
        // near top — scroll up
        const intensity = 1 - y / EDGE_ZONE;
        window.scrollBy(0, -Math.round(MAX_SPEED * intensity));
      } else if (y > vh - EDGE_ZONE) {
        // near bottom — scroll down
        const intensity = 1 - (vh - y) / EDGE_ZONE;
        window.scrollBy(0, Math.round(MAX_SPEED * intensity));
      }
      scrollRafRef.current = requestAnimationFrame(tick);
    };
    scrollRafRef.current = requestAnimationFrame(tick);
  };

  const stopAutoScroll = () => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    setDragIndex(idx);
    dragYRef.current = e.clientY;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
    startAutoScroll();
  };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    if (dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dragYRef.current = e.clientY;
    if (hoverIndex !== idx) setHoverIndex(idx);
  };
  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    stopAutoScroll();
    const from = dragIndex;
    setDragIndex(null);
    setHoverIndex(null);
    if (from === null || from === idx) return;
    onReorder(from, idx);
  };
  const handleDragEnd = () => {
    stopAutoScroll();
    setDragIndex(null);
    setHoverIndex(null);
  };

  return (
    <div className="overflow-hidden rounded-md border border-zinc-700 bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-700 bg-zinc-950 px-3 py-2">
        <div className="relative min-w-[200px] flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tìm theo tên, slug, hoặc mã sản phẩm..."
            className="h-8 w-full rounded border border-zinc-700 bg-zinc-900 pl-8 pr-3 text-[13px] text-zinc-100 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        <label className="flex items-center gap-1.5 text-[12px] text-zinc-400">
          Hiển thị
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded border border-zinc-700 bg-zinc-900 px-2 text-[12px] text-zinc-100 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <span className="text-[12px] text-zinc-400">
          {isFiltered
            ? `${totalFiltered} / ${totalCount} sản phẩm`
            : `${totalCount} sản phẩm`}
        </span>
        <Pager page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
      <table className="w-full text-[13px]">
        <thead className="border-b border-zinc-700 bg-zinc-900 text-left text-[12px] text-zinc-400">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="w-16 px-3 py-2 font-medium">Ảnh</th>
            <th className="px-3 py-2 font-medium">Tên</th>
            <th className="px-3 py-2 font-medium">Danh mục</th>
            <th className="w-20 px-3 py-2 text-center font-medium">Mã SP</th>
            <th className="w-36 px-3 py-2 text-right font-medium">Giá bán</th>
            <th className="w-40 px-3 py-2 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-zinc-400">
                {isFiltered
                  ? `Không tìm thấy sản phẩm khớp "${query}".`
                  : "Chưa có sản phẩm nào."}
              </td>
            </tr>
          ) : (
            products.map((p, idx) => {
              const prices = p.variants.map((v) => v.salePrice);
              const min = prices.length ? Math.min(...prices) : 0;
              const max = prices.length ? Math.max(...prices) : 0;
              return (
                <tr
                  key={p.id}
                  draggable={canDrag}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`border-b border-zinc-800 last:border-0 ${
                    dragIndex === idx ? "opacity-40" : ""
                  } ${
                    hoverIndex === idx && dragIndex !== idx
                      ? "bg-cyan-500/10"
                      : "hover:bg-zinc-950"
                  }`}
                >
                  <td className="px-2 py-2">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded ${
                        canDrag
                          ? "cursor-grab text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400 active:cursor-grabbing"
                          : "cursor-not-allowed text-zinc-500"
                      }`}
                      title={canDrag ? "Kéo để sắp xếp (trong trang)" : "Xoá ô tìm kiếm để sắp xếp"}
                    >
                      <DragHandle />
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded border border-zinc-800 bg-zinc-950">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-500">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-zinc-100">{p.name}</span>
                      {p.isPreorder && (
                        <span className="shrink-0 rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                          Pre-order
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">{p.slug}</div>
                  </td>
                  <td className="px-3 py-2 text-zinc-400">
                    {p.categories.length === 0 ? (
                      <span className="text-zinc-500">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {p.categories.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[11px] text-zinc-300"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-zinc-300">
                    {p.variants.length}
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-300">
                    {prices.length === 0 ? (
                      <span className="text-zinc-500">—</span>
                    ) : min === max ? (
                      <>{formatVnd(min)} ₫</>
                    ) : (
                      <>
                        {formatVnd(min)}–{formatVnd(max)} ₫
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="rounded border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-[13px] font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-950"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        className="rounded border border-red-500/60 bg-zinc-900 px-4 py-1.5 text-[13px] font-medium text-red-400 transition hover:border-red-400 hover:bg-red-500/10"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {products.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-end border-t border-zinc-700 bg-zinc-950 px-3 py-2">
          <Pager page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

type VariantDraft = {
  key: string;
  id: string | null;
  sku: string;
  listPrice: string;
  salePrice: string;
  stock: string;
  imageOp: "keep" | "remove" | "upload";
  existingImageUrl: string | null;
  previewUrl: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
};

function createEmptyVariant(): VariantDraft {
  return {
    key: crypto.randomUUID(),
    id: null,
    sku: "",
    listPrice: "",
    salePrice: "",
    stock: "0",
    imageOp: "keep",
    existingImageUrl: null,
    previewUrl: null,
    fileRef: { current: null },
  };
}

function fromExistingVariant(v: ProductVariant): VariantDraft {
  return {
    key: v.id,
    id: v.id,
    sku: v.sku,
    listPrice: String(v.listPrice),
    salePrice: String(v.salePrice),
    stock: String(v.stock),
    imageOp: "keep",
    existingImageUrl: v.imageUrl,
    previewUrl: v.imageUrl,
    fileRef: { current: null },
  };
}

function parseDigits(s: string): string {
  return s.replace(/\D+/g, "");
}

function ProductForm({
  mode,
  categories,
  resetKey,
  onCancel,
  onSaved,
}: {
  mode: Mode;
  categories: Category[];
  resetKey: number;
  onCancel: () => void;
  onSaved: (p: Product) => void;
}) {
  const editing = mode.kind === "edit" ? mode.product : null;
  const editingId = editing?.id ?? null;

  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [categoryIds, setCategoryIds] = useState<Set<string>>(
    new Set(editing?.categories.map((c) => c.id) ?? [])
  );
  const [mainPreview, setMainPreview] = useState<string | null>(
    editing?.imageUrl ?? null
  );
  const [removeMainImage, setRemoveMainImage] = useState(false);
  const mainFileRef = useRef<HTMLInputElement>(null);
  const [variants, setVariants] = useState<VariantDraft[]>(
    editing ? editing.variants.map(fromExistingVariant) : [createEmptyVariant()]
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [isPreorder, setIsPreorder] = useState(editing?.isPreorder ?? false);

  useEffect(() => {
    setName(editing?.name ?? "");
    setDescription(editing?.description ?? "");
    setCategoryIds(new Set(editing?.categories.map((c) => c.id) ?? []));
    setMainPreview(editing?.imageUrl ?? null);
    setRemoveMainImage(false);
    setVariants(
      editing ? editing.variants.map(fromExistingVariant) : [createEmptyVariant()]
    );
    setError(null);
    setIsPreorder(editing?.isPreorder ?? false);
    if (mainFileRef.current) mainFileRef.current.value = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, resetKey]);

  const updateVariant = (key: string, patch: Partial<VariantDraft>) => {
    setVariants((list) =>
      list.map((v) => (v.key === key ? { ...v, ...patch } : v))
    );
  };

  const addVariant = () => {
    setVariants((list) => [...list, createEmptyVariant()]);
  };

  const removeVariant = (key: string) => {
    setVariants((list) => {
      const next = list.filter((v) => v.key !== key);
      return next.length > 0 ? next : [createEmptyVariant()];
    });
  };

  const moveVariant = (key: string, dir: -1 | 1) => {
    setVariants((list) => {
      const idx = list.findIndex((v) => v.key === key);
      if (idx === -1) return list;
      const target = idx + dir;
      if (target < 0 || target >= list.length) return list;
      const next = list.slice();
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Tên sản phẩm là bắt buộc");
      return;
    }
    if (variants.length === 0) {
      setError("Sản phẩm phải có ít nhất một mã");
      return;
    }
    const seen = new Set<string>();
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const sku = v.sku.trim();
      if (!sku) {
        setError(`Mã sản phẩm #${i + 1} là bắt buộc`);
        return;
      }
      if (seen.has(sku.toUpperCase())) {
        setError(`Mã "${sku}" bị trùng`);
        return;
      }
      seen.add(sku.toUpperCase());
      const lp = Number(v.listPrice);
      const sp = Number(v.salePrice);
      const st = Number(v.stock || 0);
      if (!Number.isFinite(lp) || lp < 0) {
        setError(`Giá niêm yết của "${sku}" không hợp lệ`);
        return;
      }
      if (!Number.isFinite(sp) || sp < 0) {
        setError(`Giá bán của "${sku}" không hợp lệ`);
        return;
      }
      if (!Number.isFinite(st) || st < 0) {
        setError(`Tồn kho của "${sku}" không hợp lệ`);
        return;
      }
    }

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("description", description);
    if (isPreorder) fd.set("isPreorder", "1");
    for (const cid of categoryIds) fd.append("categoryIds", cid);

    const mainFile = mainFileRef.current?.files?.[0];
    if (mainFile) fd.set("image", mainFile);
    if (editing && removeMainImage && !mainFile) fd.set("removeImage", "1");

    const descriptors = variants.map((v, i) => {
      const op = v.imageOp;
      if (op === "upload") {
        const f = v.fileRef.current?.files?.[0];
        if (f) fd.set(`variantImage_${i}`, f);
      }
      return {
        id: v.id,
        sku: v.sku.trim(),
        listPrice: Number(v.listPrice),
        salePrice: Number(v.salePrice),
        stock: Number(v.stock || 0),
        imageOp: op,
      };
    });
    fd.set("variants", JSON.stringify(descriptors));

    start(async () => {
      const url = editing
        ? `/api/admin/products/${editing.id}`
        : `/api/admin/products`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? "Không thể lưu sản phẩm");
        return;
      }
      onSaved(json.product);
    });
  };

  const inputCls =
    "h-9 w-full rounded border border-zinc-700 bg-zinc-900 px-3 text-[13px] text-zinc-100 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-[4.25rem] flex h-fit flex-col gap-3 self-start rounded-md border border-zinc-700 bg-zinc-900 p-4"
    >
      <h2 className="text-[14px] font-semibold text-zinc-100">
        {editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
      </h2>

      <Field label="Tên sản phẩm" hint="Slug sẽ tự sinh từ tên sản phẩm">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Mô tả sản phẩm">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Thông tin chi tiết, tính năng nổi bật, chất liệu..."
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-[13px] text-zinc-100 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 transition hover:border-zinc-500">
        <input
          type="checkbox"
          checked={isPreorder}
          onChange={(e) => setIsPreorder(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-600 accent-orange-500"
        />
        <div>
          <span className="text-[13px] font-medium text-zinc-200">Sản phẩm đặt trước</span>
          <p className="text-[11px] text-zinc-500">Đánh dấu sản phẩm này là hàng pre-order</p>
        </div>
      </label>

      <Field
        label={`Danh mục (${categoryIds.size})`}
        hint="Có thể chọn nhiều danh mục"
      >
        <CategoryPicker
          categories={categories}
          selected={categoryIds}
          onToggle={(id) =>
            setCategoryIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
        />
      </Field>

      <Field label="Ảnh đại diện chính">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded border border-zinc-700 bg-zinc-950">
            {mainPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] text-zinc-500">—</span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <input
              ref={mainFileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setRemoveMainImage(false);
                const reader = new FileReader();
                reader.onload = () => setMainPreview(reader.result as string);
                reader.readAsDataURL(f);
              }}
              className="text-[12px] text-zinc-400 file:mr-3 file:rounded file:border file:border-zinc-600 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-zinc-200 hover:file:bg-zinc-950"
            />
            {editing && mainPreview && (
              <button
                type="button"
                onClick={() => {
                  if (mainFileRef.current) mainFileRef.current.value = "";
                  setMainPreview(null);
                  setRemoveMainImage(true);
                }}
                className="self-start text-[12px] text-red-400 hover:underline"
              >
                Xoá ảnh hiện tại
              </button>
            )}
          </div>
        </div>
      </Field>

      <div className="mt-2 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-zinc-100">
          Mã sản phẩm ({variants.length})
        </h3>
        <button
          type="button"
          onClick={addVariant}
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-950"
        >
          + Thêm mã
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {variants.map((v, i) => (
          <VariantRow
            key={v.key}
            index={i}
            total={variants.length}
            variant={v}
            onChange={(patch) => updateVariant(v.key, patch)}
            onRemove={() => removeVariant(v.key)}
            onMove={(dir) => moveVariant(v.key, dir)}
          />
        ))}
      </div>

      {error && (
        <p className="rounded border border-red-500/60 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-orange-500 bg-orange-500 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-black disabled:opacity-60"
        >
          {pending ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm sản phẩm"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-zinc-700 bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition hover:bg-zinc-950"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}

function VariantRow({
  index,
  total,
  variant,
  onChange,
  onRemove,
  onMove,
}: {
  index: number;
  total: number;
  variant: VariantDraft;
  onChange: (patch: Partial<VariantDraft>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    variant.fileRef.current = fileRef.current;
  });

  const inputCls =
    "h-9 w-full rounded border border-zinc-700 bg-zinc-900 px-3 text-[13px] text-zinc-100 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

  const listDisplay = variant.listPrice
    ? formatVnd(Number(variant.listPrice))
    : "";
  const saleDisplay = variant.salePrice
    ? formatVnd(Number(variant.salePrice))
    : "";

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-400">
          Mã #{index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Lên"
            className="grid h-7 w-7 place-items-center rounded border border-zinc-700 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Xuống"
            className="grid h-7 w-7 place-items-center rounded border border-zinc-700 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Xoá mã"
            className="grid h-7 w-7 place-items-center rounded border border-red-500/60 bg-zinc-900 text-red-400 transition hover:bg-red-500/10"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Field label="Mã (SKU)">
          <input
            type="text"
            required
            value={variant.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
            placeholder="vd: MBP14-M4-16-512"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Giá niêm yết (₫)">
            <input
              type="text"
              inputMode="numeric"
              value={listDisplay}
              onChange={(e) =>
                onChange({ listPrice: parseDigits(e.target.value) })
              }
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Giá bán (₫)">
            <input
              type="text"
              inputMode="numeric"
              value={saleDisplay}
              onChange={(e) =>
                onChange({ salePrice: parseDigits(e.target.value) })
              }
              placeholder="0"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Tồn kho">
          <input
            type="text"
            inputMode="numeric"
            value={variant.stock}
            onChange={(e) =>
              onChange({ stock: parseDigits(e.target.value) })
            }
            placeholder="0"
            className={inputCls}
          />
        </Field>

        <Field label="Ảnh mã sản phẩm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded border border-zinc-700 bg-zinc-900">
              {variant.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={variant.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-zinc-500">—</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    onChange({
                      imageOp: "upload",
                      previewUrl: reader.result as string,
                    });
                  reader.readAsDataURL(f);
                }}
                className="text-[12px] text-zinc-400 file:mr-3 file:rounded file:border file:border-zinc-600 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-zinc-200 hover:file:bg-zinc-950"
              />
              {variant.previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    if (fileRef.current) fileRef.current.value = "";
                    onChange({
                      imageOp: "remove",
                      previewUrl: null,
                    });
                  }}
                  className="self-start text-[12px] text-red-400 hover:underline"
                >
                  Xoá ảnh
                </button>
              )}
            </div>
          </div>
        </Field>
      </div>
    </div>
  );
}

function CategoryPicker({
  categories,
  selected,
  onToggle,
}: {
  categories: Category[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return categories;
    const n = normalize(q);
    return categories.filter((c) => normalize(c.name).includes(n));
  }, [categories, query]);

  const selectedList = useMemo(
    () => categories.filter((c) => selected.has(c.id)),
    [categories, selected]
  );

  if (categories.length === 0) {
    return (
      <p className="rounded border border-dashed border-zinc-700 bg-zinc-950 px-3 py-4 text-center text-[12px] text-zinc-400">
        Chưa có danh mục nào. Hãy tạo danh mục trước.
      </p>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <div
        className="flex min-h-9 flex-wrap items-center gap-1 rounded border border-zinc-700 bg-zinc-900 p-1.5 focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)]"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selectedList.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[12px] text-zinc-300"
          >
            {c.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(c.id);
              }}
              aria-label={`Bỏ ${c.name}`}
              className="grid h-4 w-4 place-items-center rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            selectedList.length === 0 ? "Chọn danh mục..." : "Thêm..."
          }
          className="min-w-[80px] flex-1 bg-transparent px-1 py-0.5 text-[13px] text-zinc-100 outline-none placeholder:text-zinc-500"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded border border-zinc-700 bg-zinc-900 ">
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-center text-[12px] text-zinc-400">
              Không có danh mục khớp.
            </p>
          ) : (
            <ul className="flex flex-col py-1">
              {filtered.map((c) => {
                const checked = selected.has(c.id);
                return (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-950">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(c.id)}
                        className="h-4 w-4 accent-slate-900"
                      />
                      <span>{c.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-zinc-200">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );
}
