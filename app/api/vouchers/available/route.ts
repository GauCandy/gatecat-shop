import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { listAvailableVouchersForUser } from "@/lib/vouchers";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vouchers = await listAvailableVouchersForUser(user.id);
  return NextResponse.json({ vouchers });
}
