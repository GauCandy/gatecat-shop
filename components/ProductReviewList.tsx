import type { Review } from "@/lib/reviews";
import { StarDisplay } from "./OrderReviewSection";

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(d));

export function ProductReviewList({
  reviews,
  average,
  count,
}: {
  reviews: Review[];
  average: number;
  count: number;
}) {
  return (
    <section className="mt-8 rounded-xl border border-[var(--color-border-strong)] bg-white p-5">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--color-text)]">
            Đánh giá của khách
          </h2>
          <p className="mt-0.5 text-[12px] text-[var(--color-text-dim)]">
            Chỉ khách đã mua và nhận hàng mới được đánh giá.
          </p>
        </div>
        {count > 0 && (
          <div className="shrink-0 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[22px] font-bold text-[var(--color-text)]">
                {average.toFixed(1)}
              </span>
              <StarDisplay rating={Math.round(average)} />
            </div>
            <p className="text-[11px] text-[var(--color-text-dim)]">
              {count} đánh giá
            </p>
          </div>
        )}
      </div>

      {count === 0 ? (
        <p className="mt-4 text-[13px] text-[var(--color-text-dim)]">
          Chưa có đánh giá nào cho sản phẩm này.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="border-b border-[var(--color-border)] pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                {r.userAvatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={r.userAvatarUrl}
                    alt={r.userName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-surface-2)] text-[12px] font-semibold text-[var(--color-text)]">
                    {r.userName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium text-[var(--color-text)]">
                      {r.userName}
                    </span>
                    <StarDisplay rating={r.rating} />
                    <span className="text-[11px] text-[var(--color-text-dim)]">
                      {formatDate(r.updatedAt)}
                      {r.updatedAt.getTime() - r.createdAt.getTime() > 1000 && (
                        <span className="ml-1">(đã sửa)</span>
                      )}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-1.5 text-[13px] text-[var(--color-text)]">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
