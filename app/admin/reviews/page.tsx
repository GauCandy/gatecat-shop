import { requireAdmin } from "@/lib/admin";
import { listReviewsForAdmin } from "@/lib/reviews";
import { ReviewModeration } from "./ReviewModeration";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await listReviewsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ ADMIN · 07 · REPORTS · MODERATION
        </p>
        <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
          Kiểm duyệt đánh giá<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Ẩn đánh giá spam. Bị ẩn = không tính avg & không hiện public, vẫn giữ DB để khôi phục.
        </p>
      </div>
      <ReviewModeration initial={reviews} />
    </div>
  );
}
