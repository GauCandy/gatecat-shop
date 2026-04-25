import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import {
  deleteAddress,
  updateAddress,
  type AddressInput,
} from "@/lib/addresses";

function parseInput(body: unknown): AddressInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const pick = (k: string) => (typeof b[k] === "string" ? (b[k] as string) : "");
  return {
    recipientName: pick("recipientName"),
    phone: pick("phone"),
    province: pick("province"),
    district: pick("district"),
    ward: pick("ward"),
    addressLine: pick("addressLine"),
    note: typeof b.note === "string" ? (b.note as string) : null,
    isDefault: b.isDefault === true,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionUser(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }

  try {
    const address = await updateAddress(session.id, id, parseInput(body));
    if (!address) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    return NextResponse.json({ address });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Không cập nhật được";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionUser(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const removed = await deleteAddress(session.id, id);
  return NextResponse.json({ removed });
}
