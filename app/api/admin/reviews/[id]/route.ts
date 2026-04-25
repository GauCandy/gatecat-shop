import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { setReviewHidden } from "@/lib/reviews";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const hidden = Boolean(body?.hidden);
    await setReviewHidden(id, hidden);
    return NextResponse.json({ ok: true, hidden });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
