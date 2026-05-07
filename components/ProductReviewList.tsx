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
    <section className="relative mt-8 border-2 border-zinc-700 bg-zinc-900 p-5">
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <span className="mc-rivet mc-rivet-bl" />
      <span className="mc-rivet mc-rivet-br" />

      <div className="flex items-center justify-between gap-4 border-b-2 border-zinc-800 pb-4">
        <div>
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ FIELD REPORTS
          </p>
          <h2 className="mt-2 text-[16px] font-black uppercase tracking-tight text-zinc-100">
            Đánh giá của khách<span className="text-orange-500">.</span>
          </h2>
          <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            ▸ Chỉ khách đã nhận hàng mới được đánh giá.
          </p>
        </div>
        {count > 0 && (
          <div className="shrink-0 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="mc-mono text-[24px] font-black text-orange-400">
                {average.toFixed(1)}
              </span>
              <StarDisplay rating={Math.round(average)} />
            </div>
            <p className="mc-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              {count} REPORT
            </p>
          </div>
        )}
      </div>

      {count === 0 ? (
        <p className="mc-mono mt-4 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Chưa có đánh giá nào cho sản phẩm này.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="border-b-2 border-zinc-800 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                {r.userAvatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={r.userAvatarUrl}
                    alt={r.userName}
                    className="h-8 w-8 shrink-0 border-2 border-zinc-700 object-cover"
                  />
                ) : (
                  <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-zinc-700 bg-orange-500 text-[12px] font-black text-zinc-950">
                    {r.userName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-black uppercase tracking-tight text-zinc-100">
                      {r.userName}
                    </span>
                    <StarDisplay rating={r.rating} />
                    <span className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      ▸ {formatDate(r.updatedAt)}
                      {r.updatedAt.getTime() - r.createdAt.getTime() > 1000 && (
                        <span className="ml-1 text-orange-500">(đã sửa)</span>
                      )}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">
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
