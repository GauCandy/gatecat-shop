import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { upsertReview } from "@/lib/reviews";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId : null;
    const productId = typeof body?.productId === "string" ? body.productId : null;
    const rating = Number(body?.rating);
    const comment = typeof body?.comment === "string" ? body.comment : null;

    if (!orderId || !productId) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const review = await upsertReview(user.id, { orderId, productId, rating, comment });
    return NextResponse.json({ review });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
