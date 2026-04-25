import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { listReviewsForAdmin } from "@/lib/reviews";

export async function GET() {
  await requireAdmin();
  const reviews = await listReviewsForAdmin();
  return NextResponse.json({ reviews });
}
