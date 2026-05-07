import { listAllVouchers } from "@/lib/vouchers";
import { VoucherManager } from "./VoucherManager";

export const dynamic = "force-dynamic";

export default async function AdminVouchersPage() {
  const vouchers = await listAllVouchers();

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ ADMIN · 05 · VOUCHERS
        </p>
        <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
          Quản lí voucher<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Tạo, chỉnh sửa và theo dõi mã giảm giá. 1 mã / 1 tài khoản.
        </p>
      </div>
      <VoucherManager initial={vouchers} />
    </div>
  );
}
