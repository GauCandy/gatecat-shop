import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { updateUserRole, type UserRole } from "@/lib/users";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const self = await requireAdmin();
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const role = body?.role as UserRole | undefined;

    if (!role || !["USER", "ADMIN", "SHIPPER"].includes(role)) {
      return NextResponse.json({ error: "Vai trò không hợp lệ" }, { status: 400 });
    }
    if (self.id === id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không thể tự gỡ quyền ADMIN của chính mình" },
        { status: 400 }
      );
    }

    const updated = await updateUserRole(id, role);
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
    }
    return NextResponse.json({ user: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
