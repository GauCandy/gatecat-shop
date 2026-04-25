import { requireAdmin } from "@/lib/admin";
import { listUsersForAdmin } from "@/lib/users";
import { UserManager } from "./UserManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [self, users] = await Promise.all([requireAdmin(), listUsersForAdmin()]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Quản lí người dùng</h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Gán vai trò ADMIN / SHIPPER / USER cho tài khoản. Người đăng nhập bằng Google sẽ được tạo tự động với vai trò USER.
        </p>
      </div>
      <UserManager initial={users} selfId={self.id} />
    </div>
  );
}
