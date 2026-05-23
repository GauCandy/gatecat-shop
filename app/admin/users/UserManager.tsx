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
  const [roleFilter, setRoleFilter] = useState<UserRole | "all" | "banned">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUserRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter === "banned") {
        if (!u.isBanned) return false;
      } else if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }
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

  const handleBan = async (user: AdminUserRow, reason: string) => {
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: true, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Cấm tài khoản thất bại");
        return;
      }
      setUsers((list) =>
        list.map((u) =>
          u.id === user.id
            ? {
                ...u,
                isBanned: data.user.isBanned,
                banReason: data.user.banReason,
                bannedAt: data.user.bannedAt,
              }
            : u
        )
      );
      toast(`Đã cấm ${user.name}`, "success");
      setBanTarget(null);
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusyId(null);
    }
  };

  const handleUnban = async (user: AdminUserRow) => {
    if (!confirm(`Gỡ cấm cho ${user.name}?`)) return;
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Gỡ cấm thất bại");
        return;
      }
      setUsers((list) =>
        list.map((u) =>
          u.id === user.id
            ? { ...u, isBanned: false, banReason: null, bannedAt: null }
            : u
        )
      );
      toast(`Đã gỡ cấm ${user.name}`, "success");
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<UserRole | "all" | "banned", number> = {
      all: users.length,
      USER: 0,
      SHIPPER: 0,
      ADMIN: 0,
      banned: 0,
    };
    for (const u of users) {
      c[u.role]++;
      if (u.isBanned) c.banned++;
    }
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
          <FilterPill
            active={roleFilter === "banned"}
            onClick={() => setRoleFilter("banned")}
            count={counts.banned}
            tone="danger"
          >
            ⛔ Bị cấm
          </FilterPill>
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
                <th className="px-3 py-2 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className={`border-b border-[var(--color-border)] last:border-b-0 ${
                    u.isBanned ? "bg-red-500/5" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {u.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className={`h-7 w-7 rounded-full object-cover ${
                            u.isBanned ? "opacity-50 grayscale" : ""
                          }`}
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
                        {u.isBanned && u.banReason && (
                          <p
                            className="mt-0.5 max-w-[260px] truncate text-[11px] text-red-400"
                            title={u.banReason}
                          >
                            ⛔ {u.banReason}
                          </p>
                        )}
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
                  <td className="px-3 py-2">
                    {u.id === selfId ? (
                      <span className="text-[11px] text-[var(--color-text-dim)]">—</span>
                    ) : u.isBanned ? (
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => handleUnban(u)}
                        className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        Gỡ cấm
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => setBanTarget(u)}
                        className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Cấm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {banTarget && (
        <BanModal
          user={banTarget}
          busy={busyId === banTarget.id}
          onCancel={() => setBanTarget(null)}
          onConfirm={(reason) => handleBan(banTarget, reason)}
        />
      )}
    </div>
  );
}

function BanModal({
  user,
  busy,
  onCancel,
  onConfirm,
}: {
  user: AdminUserRow;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border-2 border-red-500/60 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.28em] text-red-400">
          ⛔ Cấm tài khoản
        </p>
        <h2 className="mt-2 text-[18px] font-bold text-zinc-100">{user.name}</h2>
        <p className="text-[12px] text-zinc-400">{user.email}</p>

        <label className="mc-mono mt-5 block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          ▸ Lý do cấm <span className="text-red-400">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          autoFocus
          rows={4}
          placeholder="Ví dụ: vi phạm điều khoản, spam đơn hàng giả, hành vi gian lận..."
          className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none transition focus:border-red-500"
        />
        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Lý do này sẽ hiển thị cho user khi họ cố đăng nhập</span>
          <span>{reason.length}/500</span>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-[12px] font-semibold text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(trimmed)}
            disabled={busy || !trimmed}
            className="rounded-md border-2 border-red-500 bg-red-500 px-3 py-1.5 text-[12px] font-black uppercase tracking-wide text-zinc-950 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Đang cấm…" : "Cấm tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  count,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
  tone?: "danger";
}) {
  const base =
    "rounded-full px-3 py-1.5 text-[12px] font-medium transition";
  const inactive =
    tone === "danger"
      ? "border border-red-500/40 bg-red-500/5 text-red-300 hover:bg-red-500/10"
      : "border border-[var(--color-border)] bg-zinc-900 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]";
  const activeCls =
    tone === "danger"
      ? "bg-red-500 text-zinc-950"
      : "bg-[var(--color-text)] text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? activeCls : inactive}`}
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
