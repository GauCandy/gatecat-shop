import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { deleteVoucher, updateVoucher, type VoucherInput } from "@/lib/vouchers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  try {
    const { id } = await params;
    const body = (await req.json()) as VoucherInput;
    const voucher = await updateVoucher(id, body);
    return NextResponse.json({ voucher });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  try {
    const { id } = await params;
    await deleteVoucher(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
