"use client";

import { useMemo, useState } from "react";
import type { AdminUserRow, UserRole } from "@/lib/users";
import { toast } from "@/components/Toaster";

const ROLE_OPTIONS: UserRole[] = ["USER", "SHIPPER", "ADMIN"];

const ROLE_BADGE: Record<UserRole, string> = {
  USER: "bg-zinc-800 text-zinc-300",
  SHIPPER: "bg-cyan-500/15 text-cyan-300",
  ADMIN: "bg-purple-500/15 text-purple-300",
};

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(d)
  );

export function UserManager({
  initial,
  selfId,
}: {
  initial: AdminUserRow[];
  selfId: string;
}) {
  const [users, setUsers] = useState(initial);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const handleRoleChange = async (user: AdminUserRow, role: UserRole) => {
    if (role === user.role) return;
    if (
      user.id === selfId &&
      role !== "ADMIN" &&
      !confirm("Bạn đang tự gỡ quyền ADMIN của chính mình — bạn sẽ mất quyền truy cập admin. Tiếp tục?")
    ) {
      return;
    }
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Đổi vai trò thất bại");
        return;
      }
      setUsers((list) =>
        list.map((u) => (u.id === user.id ? { ...u, role: data.user.role } : u))
      );
      toast(`${user.name}: ${user.role} → ${role}`, "success");
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<UserRole | "all", number> = {
      all: users.length,
      USER: 0,
      SHIPPER: 0,
      ADMIN: 0,
    };
    for (const u of users) c[u.role]++;
    return c;
  }, [users]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, email, ID..."
          className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] md:max-w-sm"
        />
        <div className="flex flex-wrap gap-1">
          <FilterPill
            active={roleFilter === "all"}
            onClick={() => setRoleFilter("all")}
            count={counts.all}
          >
            Tất cả
          </FilterPill>
          {ROLE_OPTIONS.map((r) => (
            <FilterPill
              key={r}
              active={roleFilter === r}
              onClick={() => setRoleFilter(r)}
              count={counts[r]}
            >
              {r}
            </FilterPill>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-10 text-center">
          <p className="text-[14px] font-medium text-[var(--color-text)]">
            Không có người dùng nào khớp
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-zinc-900">
          <table className="min-w-full text-[13px]">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] text-[11px] uppercase tracking-wider text-[var(--color-text-dim)]">
              <tr>
                <th className="px-3 py-2 text-left">Tài khoản</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Vai trò</th>
                <th className="px-3 py-2 text-right">Đơn</th>
                <th className="px-3 py-2 text-left">Tham gia</th>
                <th className="px-3 py-2 text-left">Đổi vai trò</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {u.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-surface-2)] text-[11px] font-semibold text-[var(--color-text)]">
                          {u.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-text)]">
                          {u.name}
                          {u.id === selfId && (
                            <span className="ml-2 text-[10px] font-normal text-[var(--color-text-dim)]">
                              (bạn)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[var(--color-text-dim)]">{u.email}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_BADGE[u.role]}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">
                    {u.orderCount}
                  </td>
                  <td className="px-3 py-2 text-[var(--color-text-dim)]">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                      className="h-8 rounded-md border border-[var(--color-border)] bg-zinc-900 px-2 text-[12px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
        active
          ? "bg-[var(--color-text)] text-white"
          : "border border-[var(--color-border)] bg-zinc-900 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
      }`}
    >
      {children}
      <span
        className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
          active ? "bg-zinc-900/20" : "bg-[var(--color-surface-2)]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
