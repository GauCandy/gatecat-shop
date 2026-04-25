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
    <div className="mt-6 border-t border-[var(--color-border)] pt-6">
      <h2 className="text-[14px] font-bold text-[var(--color-text)]">
        Đánh giá sản phẩm
      </h2>
      <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
        Chia sẻ trải nghiệm của bạn. Mỗi sản phẩm chỉ được đánh giá 1 lần trong đơn này, nhưng có thể sửa bất kỳ lúc nào.
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
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
      <div className="flex items-start gap-3">
        {product.variantImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.variantImageUrl}
            alt={product.productName}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-md border border-[var(--color-border)] bg-white object-cover"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-md bg-white" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[var(--color-text)]">
            {product.productName}
          </p>
          <p className="text-[11px] text-[var(--color-text-dim)]">
            {product.variantSku}
          </p>
        </div>
        {existing && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-[12px] text-[var(--color-accent)] hover:underline"
          >
            Sửa
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
            className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy || rating < 1}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Đang lưu..." : existing ? "Lưu thay đổi" : "Gửi đánh giá"}
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
                className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-1.5 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
              >
                Huỷ
              </button>
            )}
          </div>
        </div>
      ) : (
        existing && (
          <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-white p-3">
            <StarDisplay rating={existing.rating} />
            {existing.comment && (
              <p className="mt-2 text-[13px] text-[var(--color-text)]">
                {existing.comment}
              </p>
            )}
            <p className="mt-1 text-[11px] text-[var(--color-text-dim)]">
              Đánh giá lúc{" "}
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
          className={`text-[22px] transition ${
            i <= display ? "text-yellow-500" : "text-[var(--color-border-strong)]"
          } disabled:cursor-not-allowed`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-[12px] text-[var(--color-text-dim)]">
        {value > 0 ? `${value}/5` : "Chọn số sao"}
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
            i <= rating ? "text-yellow-500" : "text-[var(--color-border-strong)]"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
