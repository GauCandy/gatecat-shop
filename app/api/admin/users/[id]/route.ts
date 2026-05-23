import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  updateUserRole,
  banUser,
  unbanUser,
  type UserRole,
} from "@/lib/users";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const self = await requireAdmin();
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as {
      role?: UserRole;
      banned?: boolean;
      reason?: string;
    };

    // Action 1: ban / unban
    if (typeof body.banned === "boolean") {
      if (self.id === id) {
        return NextResponse.json(
          { error: "Không thể tự cấm chính mình" },
          { status: 400 }
        );
      }
      if (body.banned) {
        const reason = typeof body.reason === "string" ? body.reason : "";
        const updated = await banUser(id, reason);
        if (!updated) {
          return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
        }
        return NextResponse.json({ user: updated });
      } else {
        const updated = await unbanUser(id);
        if (!updated) {
          return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
        }
        return NextResponse.json({ user: updated });
      }
    }

    // Action 2: đổi role
    const role = body.role;
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
