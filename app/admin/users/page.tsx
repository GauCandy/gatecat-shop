import { requireAdmin } from "@/lib/admin";
import { listUsersForAdmin } from "@/lib/users";
import { UserManager } from "./UserManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [self, users] = await Promise.all([requireAdmin(), listUsersForAdmin()]);
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ ADMIN · 06 · OPERATORS
        </p>
        <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
          Quản lí người dùng<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Gán role ADMIN / SHIPPER / USER. Google login auto-tạo với role USER.
        </p>
      </div>
      <UserManager initial={users} selfId={self.id} />
    </div>
  );
}
