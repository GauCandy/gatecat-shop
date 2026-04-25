import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createVoucher, listAllVouchers, type VoucherInput } from "@/lib/vouchers";

export async function GET() {
  await requireAdmin();
  const vouchers = await listAllVouchers();
  return NextResponse.json({ vouchers });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  try {
    const body = (await req.json()) as VoucherInput;
    const voucher = await createVoucher(body);
    return NextResponse.json({ voucher }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
