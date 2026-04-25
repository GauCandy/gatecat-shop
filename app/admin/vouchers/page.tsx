import { listAllVouchers } from "@/lib/vouchers";
import { VoucherManager } from "./VoucherManager";

export const dynamic = "force-dynamic";

export default async function AdminVouchersPage() {
  const vouchers = await listAllVouchers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Quản lí voucher
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Tạo, chỉnh sửa và theo dõi mã giảm giá. Mỗi mã chỉ được dùng 1 lần / tài khoản.
        </p>
      </div>
      <VoucherManager initial={vouchers} />
    </div>
  );
}
