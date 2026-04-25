import { requireAdmin } from "@/lib/admin";
import { listReviewsForAdmin } from "@/lib/reviews";
import { ReviewModeration } from "./ReviewModeration";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await listReviewsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Kiểm duyệt đánh giá</h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Ẩn các đánh giá đểu / spam. Đánh giá bị ẩn sẽ không hiện trên trang sản phẩm và không tính vào điểm trung bình — nhưng vẫn giữ trong DB để có thể bỏ ẩn.
        </p>
      </div>
      <ReviewModeration initial={reviews} />
    </div>
  );
}
