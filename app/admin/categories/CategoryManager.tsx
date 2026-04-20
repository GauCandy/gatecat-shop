"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/categories";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; category: Category };

type Row = { category: Category; depth: number };

const PAGE_SIZES = [10, 25, 50, 100] as const;

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function sortByTree(flat: Category[]): Row[] {
  const byParent = new Map<string | null, Category[]>();
  for (const c of flat) {
    const arr = byParent.get(c.parentId);
    if (arr) arr.push(c);
    else byParent.set(c.parentId, [c]);
  }
  const out: Row[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const c of byParent.get(parentId) ?? []) {
      out.push({ category: c, depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

function collectDescendantIds(flat: Category[], rootId: string): Set<string> {
  const byParent = new Map<string, Category[]>();
  for (const c of flat) {
    if (c.parentId) {
      const arr = byParent.get(c.parentId);
      if (arr) arr.push(c);
      else byParent.set(c.parentId, [c]);
    }
  }
  const out = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    for (const child of byParent.get(id) ?? []) {
      if (!out.has(child.id)) {
        out.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return out;
}

export function CategoryManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [mode, setMode] = useState<Mode>({ kind: "create" });
  const [formNonce, setFormNonce] = useState(0);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const router = useRouter();

  const trimmed = query.trim();
  const isFiltered = trimmed.length > 0;

  const treeRows = useMemo(() => sortByTree(categories), [categories]);

  const parentOf = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const c of categories) m.set(c.id, c.parentId);
    return m;
  }, [categories]);

  const childCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of categories) {
      if (c.parentId) m.set(c.parentId, (m.get(c.parentId) ?? 0) + 1);
    }
    return m;
  }, [categories]);

  // Khi không tìm kiếm: chỉ hiển thị các dòng mà toàn bộ tổ tiên đều đang mở.
  const visibleRows = useMemo(() => {
    if (isFiltered) return treeRows;
    return treeRows.filter((r) => {
      let p = parentOf.get(r.category.id) ?? null;
      while (p) {
        if (!expanded.has(p)) return false;
        p = parentOf.get(p) ?? null;
      }
      return true;
    });
  }, [treeRows, isFiltered, expanded, parentOf]);

  const filteredRows = useMemo(() => {
    if (!isFiltered) return visibleRows;
    const q = normalize(trimmed);
    return visibleRows.filter(
      (r) => normalize(r.category.name).includes(q) || normalize(r.category.slug).includes(q)
    );
  }, [visibleRows, isFiltered, trimmed]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    for (const [id, n] of childCount) if (n > 0) all.add(id);
    setExpanded(all);
  };

  const collapseAll = () => setExpanded(new Set());

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageSlice = filteredRows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [trimmed, pageSize]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const persistOrder = async (next: Category[]) => {
    const res = await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((c) => c.id) }),
    });
    if (!res.ok) alert("Không thể lưu thứ tự mới");
    router.refresh();
  };

  const handleReorderWithinPage = (fromVisible: number, toVisible: number) => {
    if (fromVisible === toVisible) return;
    const fromRow = pageSlice[fromVisible];
    const toRow = pageSlice[toVisible];
    if (!fromRow || !toRow) return;
    // Chỉ cho kéo giữa các danh mục cùng cha (cùng cấp).
    if (fromRow.category.parentId !== toRow.category.parentId) return;

    // Tìm vị trí tương ứng trong mảng phẳng theo thứ tự cây, rồi dịch chuyển.
    const currentOrder = treeRows.map((r) => r.category);
    const globalFrom = currentOrder.findIndex((c) => c.id === fromRow.category.id);
    const globalTo = currentOrder.findIndex((c) => c.id === toRow.category.id);
    if (globalFrom < 0 || globalTo < 0) return;
    const next = currentOrder.slice();
    const [moved] = next.splice(globalFrom, 1);
    next.splice(globalTo, 0, moved);
    setCategories(next);
    persistOrder(next);
  };

  const canDrag = !isFiltered;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <CategoryList
        rows={pageSlice}
        query={query}
        onQueryChange={setQuery}
        isFiltered={isFiltered}
        totalCount={categories.length}
        totalFiltered={filteredRows.length}
        page={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        canDrag={canDrag}
        expanded={expanded}
        childCount={childCount}
        onToggleExpand={toggleExpanded}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onEdit={(c) => setMode({ kind: "edit", category: c })}
        onDelete={async (c) => {
          if (!confirm(`Xoá danh mục "${c.name}"? Các danh mục con cũng sẽ bị xoá.`)) return;
          const res = await fetch(`/api/admin/categories/${c.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: "Lỗi" }));
            alert(error ?? "Không thể xoá danh mục");
            return;
          }
          const descendants = collectDescendantIds(categories, c.id);
          descendants.add(c.id);
          setCategories((list) => list.filter((x) => !descendants.has(x.id)));
          if (mode.kind === "edit" && descendants.has(mode.category.id)) {
            setMode({ kind: "create" });
          }
          router.refresh();
        }}
        onReorder={handleReorderWithinPage}
      />

      <CategoryForm
        mode={mode}
        categories={categories}
        resetKey={formNonce}
        onCancel={() => setMode({ kind: "create" })}
        onSaved={(saved) => {
          setCategories((list) => {
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
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) {
      onJump(n);
    }
    setVal("");
  };

  return (
    <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
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
        className="h-7 w-14 rounded border border-slate-300 bg-white px-1.5 text-center text-[12px] text-slate-900 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
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
    "min-w-[28px] rounded border border-slate-300 bg-white px-2 py-1 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

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
            className="px-1 text-[12px] text-slate-400 select-none"
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
                ? "min-w-[28px] rounded border border-slate-900 bg-slate-900 px-2 py-1 text-[12px] font-medium text-white"
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

function CategoryList({
  rows,
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
  expanded,
  childCount,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  onEdit,
  onDelete,
  onReorder,
}: {
  rows: Row[];
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
  expanded: Set<string>;
  childCount: Map<string, number>;
  onToggleExpand: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    if (dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (hoverIndex !== idx) setHoverIndex(idx);
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragIndex;
    setDragIndex(null);
    setHoverIndex(null);
    if (from === null || from === idx) return;
    onReorder(from, idx);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setHoverIndex(null);
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-300 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2">
        <div className="relative min-w-[200px] flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tìm theo tên hoặc slug..."
            className="h-8 w-full rounded border border-slate-300 bg-white pl-8 pr-3 text-[13px] text-slate-900 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        <label className="flex items-center gap-1.5 text-[12px] text-slate-600">
          Hiển thị
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded border border-slate-300 bg-white px-2 text-[12px] text-slate-900 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <span className="text-[12px] text-slate-500">
          {isFiltered
            ? `${totalFiltered} / ${totalCount} danh mục`
            : `${totalCount} danh mục`}
        </span>
        {!isFiltered && childCount.size > 0 && (
          <div className="flex items-center gap-1 text-[12px]">
            <button
              type="button"
              onClick={onExpandAll}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 transition hover:bg-slate-50"
            >
              Mở tất cả
            </button>
            <button
              type="button"
              onClick={onCollapseAll}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 transition hover:bg-slate-50"
            >
              Thu gọn
            </button>
          </div>
        )}
        <Pager
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
      <table className="w-full text-[13px]">
        <thead className="border-b border-slate-300 bg-slate-100 text-left text-[12px] text-slate-600">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="w-16 px-3 py-2 font-medium">Ảnh</th>
            <th className="px-3 py-2 font-medium">Tên</th>
            <th className="px-3 py-2 font-medium">Slug</th>
            <th className="w-40 px-3 py-2 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-8 text-center text-slate-500"
              >
                {isFiltered
                  ? `Không tìm thấy danh mục khớp "${query}".`
                  : "Chưa có danh mục nào."}
              </td>
            </tr>
          ) : (
            rows.map(({ category: c, depth }, idx) => (
              <tr
                key={c.id}
                draggable={canDrag}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`border-b border-slate-200 last:border-0 ${
                  dragIndex === idx ? "opacity-40" : ""
                } ${
                  hoverIndex === idx && dragIndex !== idx
                    ? "bg-blue-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="px-2 py-2">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded ${
                      canDrag
                        ? "cursor-grab text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
                        : "cursor-not-allowed text-slate-300"
                    }`}
                    title={
                      canDrag
                        ? "Kéo để sắp xếp (cùng cấp)"
                        : "Xoá ô tìm kiếm để sắp xếp"
                    }
                  >
                    <DragHandle />
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="grid h-10 w-10 place-items-center overflow-hidden rounded border border-slate-200 bg-slate-50">
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">
                  <span
                    style={{ paddingLeft: depth * 18 }}
                    className="flex items-center gap-1.5"
                  >
                    {(() => {
                      const kids = childCount.get(c.id) ?? 0;
                      if (kids > 0) {
                        const isOpen = expanded.has(c.id);
                        return (
                          <button
                            type="button"
                            onClick={() => onToggleExpand(c.id)}
                            aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
                            aria-expanded={isOpen}
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                              className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                            >
                              <polyline points="9 6 15 12 9 18" />
                            </svg>
                          </button>
                        );
                      }
                      if (depth > 0) {
                        return (
                          <span className="inline-block w-5 text-slate-400" aria-hidden>
                            └
                          </span>
                        );
                      }
                      return <span className="inline-block w-5" aria-hidden />;
                    })()}
                    <span>{c.name}</span>
                    {(childCount.get(c.id) ?? 0) > 0 && (
                      <span className="text-[11px] font-normal text-slate-400">
                        ({childCount.get(c.id)})
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-500">{c.slug}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(c)}
                      className="rounded border border-slate-300 bg-white px-4 py-1.5 text-[13px] font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(c)}
                      className="rounded border border-red-300 bg-white px-4 py-1.5 text-[13px] font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50"
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {rows.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-end border-t border-slate-300 bg-slate-50 px-3 py-2">
          <Pager
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

function CategoryForm({
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
  onSaved: (c: Category) => void;
}) {
  const editing = mode.kind === "edit" ? mode.category : null;
  const editingId = editing?.id ?? null;
  const [name, setName] = useState(editing?.name ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [parentId, setParentId] = useState<string>(editing?.parentId ?? "");
  const [preview, setPreview] = useState<string | null>(editing?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  const parentOptions = useMemo(() => {
    const excluded = new Set<string>();
    if (editingId) {
      excluded.add(editingId);
      for (const id of collectDescendantIds(categories, editingId)) excluded.add(id);
    }
    return sortByTree(categories).filter((r) => !excluded.has(r.category.id));
  }, [categories, editingId]);

  useEffect(() => {
    setName(editing?.name ?? "");
    setSlug(editing?.slug ?? "");
    setParentId(editing?.parentId ?? "");
    setPreview(editing?.imageUrl ?? null);
    setRemoveImage(false);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
    // reset khi chuyển sang sửa mục khác, huỷ, hoặc sau khi lưu tạo mới (resetKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, resetKey]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("name", name);
    fd.set("slug", slug);
    fd.set("parentId", parentId);
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("image", file);
    if (editing && removeImage && !file) fd.set("removeImage", "1");

    start(async () => {
      const url = editing
        ? `/api/admin/categories/${editing.id}`
        : `/api/admin/categories`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? "Không thể lưu danh mục");
        return;
      }
      onSaved(json.category);
    });
  };

  const inputCls =
    "h-9 w-full rounded border border-slate-300 bg-white px-3 text-[13px] text-slate-900 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-[4.25rem] flex h-fit flex-col gap-3 self-start rounded-md border border-slate-300 bg-white p-4"
    >
      <h2 className="text-[14px] font-semibold text-slate-900">
        {editing ? "Sửa danh mục" : "Thêm danh mục"}
      </h2>

      <Field label="Tên danh mục">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Slug" hint="Để trống sẽ tự sinh từ tên danh mục">
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="vd: laptop-gaming"
          className={inputCls}
        />
      </Field>

      <Field label="Danh mục cha" hint="Để trống nếu là danh mục gốc">
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className={inputCls}
        >
          <option value="">— Không có (danh mục gốc)</option>
          {parentOptions.map(({ category: c, depth }) => (
            <option key={c.id} value={c.id}>
              {"\u00A0\u00A0".repeat(depth)}
              {depth > 0 ? "└ " : ""}
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Hình ảnh">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded border border-slate-300 bg-slate-50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] text-slate-400">—</span>
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
                setRemoveImage(false);
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(f);
              }}
              className="text-[12px] text-slate-600 file:mr-3 file:rounded file:border file:border-slate-400 file:bg-white file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-slate-800 hover:file:bg-slate-50"
            />
            {editing && preview && (
              <button
                type="button"
                onClick={() => {
                  if (fileRef.current) fileRef.current.value = "";
                  setPreview(null);
                  setRemoveImage(true);
                }}
                className="self-start text-[12px] text-red-600 hover:underline"
              >
                Xoá ảnh hiện tại
              </button>
            )}
          </div>
        </div>
      </Field>

      {error && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-black disabled:opacity-60"
        >
          {pending ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm danh mục"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-[13px] text-slate-700 transition hover:bg-slate-50"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
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
      <span className="text-[12px] font-medium text-slate-800">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}
