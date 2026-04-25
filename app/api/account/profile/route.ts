import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { getUserProfile, updateUserProfile, type Gender } from "@/lib/users";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionUser(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionUser(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }
  const { name, phone, dateOfBirth, gender } = (body ?? {}) as {
    name?: unknown;
    phone?: unknown;
    dateOfBirth?: unknown;
    gender?: unknown;
  };
  if (typeof name !== "string")
    return NextResponse.json({ error: "Thiếu tên" }, { status: 400 });

  try {
    const profile = await updateUserProfile(session.id, {
      name,
      phone: typeof phone === "string" ? phone : null,
      dateOfBirth: typeof dateOfBirth === "string" ? dateOfBirth : null,
      gender: typeof gender === "string" ? (gender as Gender) : null,
    });
    return NextResponse.json({ profile });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Không cập nhật được";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
