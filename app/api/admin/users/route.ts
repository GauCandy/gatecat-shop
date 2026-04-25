import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { listUsersForAdmin } from "@/lib/users";

export async function GET() {
  await requireAdmin();
  const users = await listUsersForAdmin();
  return NextResponse.json({ users });
}
