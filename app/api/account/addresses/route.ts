import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import {
  createAddress,
  listAddresses,
  type AddressInput,
} from "@/lib/addresses";

function parseInput(body: unknown): AddressInput | string {
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

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionUser(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await listAddresses(session.id);
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionUser(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }
  const input = parseInput(body);
  if (typeof input === "string")
    return NextResponse.json({ error: input }, { status: 400 });

  try {
    const address = await createAddress(session.id, input);
    return NextResponse.json({ address }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Không lưu được địa chỉ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
