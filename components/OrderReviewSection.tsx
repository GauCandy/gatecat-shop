"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toaster";
import type { ReviewableProduct } from "@/lib/reviews";

export function OrderReviewSection({
  orderId,
  products,
}: {
  orderId: string;
  products: ReviewableProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <div className="mt-6 border-t-2 border-zinc-800 pt-6">
      <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
        ⬢ FIELD REPORT · GIVE FEEDBACK
      </p>
      <h2 className="mt-2 text-[16px] font-black uppercase tracking-tight text-zinc-100">
        Đánh giá sản phẩm<span className="text-orange-500">.</span>
      </h2>
      <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        ▸ Mỗi sản phẩm chỉ đánh giá 1 lần / đơn — sửa bất kỳ lúc nào.
      </p>
      <div className="mt-4 space-y-3">
        {products.map((p) => (
          <ProductReviewForm key={p.productId} orderId={orderId} product={p} />
        ))}
      </div>
    </div>
  );
}

function ProductReviewForm({
  orderId,
  product,
}: {
  orderId: string;
  product: ReviewableProduct;
}) {
  const router = useRouter();
  const existing = product.existingReview;
  const [rating, setRating] = useState<number>(existing?.rating ?? 0);
  const [comment, setComment] = useState<string>(existing?.comment ?? "");
  const [editing, setEditing] = useState<boolean>(!existing);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast("Vui lòng chọn số sao từ 1 đến 5", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId: product.productId,
          rating,
          comment: comment.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data?.error ?? "Không lưu được đánh giá", "error");
        return;
      }
      toast(existing ? "Đã cập nhật đánh giá" : "Đã gửi đánh giá", "success");
      setEditing(false);
      router.refresh();
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-2 border-zinc-800 bg-zinc-950 p-3">
      <div className="flex items-start gap-3">
        {product.variantImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.variantImageUrl}
            alt={product.productName}
            loading="lazy"
            className="h-12 w-12 shrink-0 border-2 border-zinc-700 bg-zinc-900 object-cover"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 border-2 border-zinc-700 bg-zinc-900" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black uppercase tracking-tight text-zinc-100">
            {product.productName}
          </p>
          <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            ▸ SN: {product.variantSku}
          </p>
        </div>
        {existing && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mc-mono shrink-0 text-[10px] font-black uppercase tracking-[0.22em] text-orange-400 hover:text-orange-300"
          >
            ▸ SỬA
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3">
          <StarInput value={rating} onChange={setRating} disabled={busy} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn (tuỳ chọn)"
            rows={2}
            disabled={busy}
            className="mc-mono mt-2 w-full resize-none border-2 border-zinc-700 bg-zinc-900 px-3 py-2 text-[12px] uppercase tracking-[0.04em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy || rating < 1}
              className="mc-btn-primary disabled:opacity-50"
            >
              ⬢ {busy ? "ĐANG LƯU..." : existing ? "LƯU" : "GỬI"}
            </button>
            {existing && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  setRating(existing.rating);
                  setComment(existing.comment ?? "");
                }}
                className="mc-btn-outline disabled:opacity-50"
              >
                ✕ HUỶ
              </button>
            )}
          </div>
        </div>
      ) : (
        existing && (
          <div className="mt-3 border-2 border-zinc-800 bg-zinc-900 p-3">
            <StarDisplay rating={existing.rating} />
            {existing.comment && (
              <p className="mt-2 text-[13px] text-zinc-300">
                {existing.comment}
              </p>
            )}
            <p className="mc-mono mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              ▸ Đánh giá lúc{" "}
              {new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(existing.updatedAt))}
            </p>
          </div>
        )
      )}
    </div>
  );
}

function StarInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState<number>(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          aria-label={`${i} sao`}
          className={`text-[24px] transition ${
            i <= display ? "text-orange-500" : "text-zinc-700"
          } disabled:cursor-not-allowed hover:scale-110`}
        >
          ★
        </button>
      ))}
      <span className="mc-mono ml-2 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
        {value > 0 ? `${value}/5 STAR` : "▸ CHỌN SAO"}
      </span>
    </div>
  );
}

export function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-[16px] ${
            i <= rating ? "text-orange-500" : "text-zinc-700"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
