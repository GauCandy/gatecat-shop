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
          placeholder="QUERY · SP, NGƯỜI ĐÁNH GIÁ, NỘI DUNG..."
          className="mc-mono h-10 w-full border-2 border-zinc-700 bg-zinc-900 px-3 text-[12px] font-bold uppercase tracking-[0.1em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none md:max-w-md"
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
        <div className="border-2 border-dashed border-zinc-700 bg-zinc-900 p-10 text-center">
          <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
            ⬢ KHÔNG CÓ ĐÁNH GIÁ NÀO KHỚP
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`border-2 p-4 transition ${
                r.isHidden
                  ? "border-red-500/40 bg-red-500/5"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/products/${r.productSlug}`}
                      target="_blank"
                      className="text-[13px] font-black uppercase tracking-tight text-zinc-100 hover:text-orange-400 hover:underline"
                    >
                      {r.productName}
                    </Link>
                    {r.isHidden && (
                      <span className="mc-mono border-2 border-red-500/60 bg-red-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.22em] text-red-300">
                        ⚠ HIDDEN
                      </span>
                    )}
                  </div>
                  <div className="mc-mono mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
                    <span className="text-orange-500">
                      {"★".repeat(r.rating)}
                      <span className="text-zinc-700">
                        {"★".repeat(5 - r.rating)}
                      </span>
                    </span>
                    <span className="font-bold text-zinc-200">
                      ▸ {r.userName}
                    </span>
                    <span className="text-zinc-500">
                      ▸ {formatDate(r.updatedAt)}
                    </span>
                  </div>
                  {r.comment ? (
                    <p className="mt-2 whitespace-pre-wrap text-[13px] text-zinc-300">
                      {r.comment}
                    </p>
                  ) : (
                    <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      ▸ (KHÔNG CÓ NỘI DUNG)
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => toggleHidden(r)}
                  className={`mc-mono inline-flex h-9 shrink-0 items-center justify-center gap-1 border-2 px-4 text-[10px] font-black uppercase tracking-[0.22em] transition disabled:opacity-50 ${
                    r.isHidden
                      ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-orange-500 hover:text-orange-400"
                      : "border-red-500/60 bg-zinc-950 text-red-400 hover:border-red-500 hover:bg-red-500/10 hover:text-red-300"
                  }`}
                >
                  {busyId === r.id ? "..." : r.isHidden ? "⬢ HIỆN LẠI" : "✕ ẨN"}
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
      className={`mc-mono inline-flex items-center gap-2 border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] transition ${
        active
          ? "border-orange-500 bg-orange-500 text-zinc-950 shadow-[2px_2px_0_#09090b]"
          : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100"
      }`}
    >
      ⬢ {children}
      <span
        className={`px-1.5 py-0.5 text-[9px] ${
          active ? "bg-zinc-950 text-orange-400" : "bg-zinc-800 text-zinc-300"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
