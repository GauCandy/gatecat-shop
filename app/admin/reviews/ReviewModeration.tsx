"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminReviewRow } from "@/lib/reviews";
import { toast } from "@/components/Toaster";

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));

type Filter = "all" | "visible" | "hidden";

export function ReviewModeration({ initial }: { initial: AdminReviewRow[] }) {
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const hidden = reviews.filter((r) => r.isHidden).length;
    return { all: reviews.length, visible: reviews.length - hidden, hidden };
  }, [reviews]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filter === "visible" && r.isHidden) return false;
      if (filter === "hidden" && !r.isHidden) return false;
      if (!q) return true;
      return (
        r.productName.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        (r.comment ?? "").toLowerCase().includes(q)
      );
    });
  }, [reviews, filter, query]);

  const toggleHidden = async (r: AdminReviewRow) => {
    const nextHidden = !r.isHidden;
    if (
      nextHidden &&
      !confirm(`Ẩn đánh giá "${r.userName} — ${r.rating}★" trên "${r.productName}"?`)
    ) {
      return;
    }
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/admin/reviews/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: nextHidden }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data?.error ?? "Không cập nhật được", "error");
        return;
      }
      setReviews((list) =>
        list.map((x) => (x.id === r.id ? { ...x, isHidden: nextHidden } : x))
      );
      toast(nextHidden ? "Đã ẩn đánh giá" : "Đã hiển thị lại đánh giá", "success");
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo sản phẩm, người đánh giá, nội dung..."
          className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] md:max-w-sm"
        />
        <div className="flex flex-wrap gap-1">
          <Pill active={filter === "all"} onClick={() => setFilter("all")} count={counts.all}>
            Tất cả
          </Pill>
          <Pill
            active={filter === "visible"}
            onClick={() => setFilter("visible")}
            count={counts.visible}
          >
            Đang hiển thị
          </Pill>
          <Pill
            active={filter === "hidden"}
            onClick={() => setFilter("hidden")}
            count={counts.hidden}
          >
            Đã ẩn
          </Pill>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-10 text-center">
          <p className="text-[14px] font-medium text-[var(--color-text)]">
            Không có đánh giá nào khớp
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`rounded-lg border p-4 transition ${
                r.isHidden
                  ? "border-red-200 bg-red-50/40"
                  : "border-[var(--color-border)] bg-white"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/products/${r.productSlug}`}
                      target="_blank"
                      className="text-[13px] font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
                    >
                      {r.productName}
                    </Link>
                    {r.isHidden && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-yellow-500">
                      {"★".repeat(r.rating)}
                      <span className="text-[var(--color-border-strong)]">
                        {"★".repeat(5 - r.rating)}
                      </span>
                    </span>
                    <span className="text-[12px] font-medium text-[var(--color-text)]">
                      {r.userName}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-dim)]">
                      {formatDate(r.updatedAt)}
                    </span>
                  </div>
                  {r.comment ? (
                    <p className="mt-2 whitespace-pre-wrap text-[13px] text-[var(--color-text)]">
                      {r.comment}
                    </p>
                  ) : (
                    <p className="mt-2 text-[12px] italic text-[var(--color-text-dim)]">
                      (Không có nội dung)
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => toggleHidden(r)}
                  className={`h-9 shrink-0 rounded-lg px-4 text-[12px] font-semibold transition disabled:opacity-50 ${
                    r.isHidden
                      ? "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                      : "border border-red-300 bg-white text-red-600 hover:bg-red-50"
                  }`}
                >
                  {busyId === r.id ? "..." : r.isHidden ? "Hiện lại" : "Ẩn đánh giá"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
        active
          ? "bg-[var(--color-text)] text-white"
          : "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
      }`}
    >
      {children}
      <span
        className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
          active ? "bg-white/20" : "bg-[var(--color-surface-2)]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
