"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Address, AddressInput } from "@/lib/addresses";

const EMPTY: AddressInput = {
  recipientName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  addressLine: "",
  note: null,
  isDefault: false,
};

export function AddressBookClient({ initial }: { initial: Address[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Address[]>(initial);
  const [editing, setEditing] = useState<{
    id: string | null;
    data: AddressInput;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setError(null);
    setEditing({ id: null, data: { ...EMPTY, isDefault: items.length === 0 } });
  };
  const openEdit = (a: Address) => {
    setError(null);
    setEditing({
      id: a.id,
      data: {
        recipientName: a.recipientName,
        phone: a.phone,
        province: a.province,
        district: a.district,
        ward: a.ward,
        addressLine: a.addressLine,
        note: a.note,
        isDefault: a.isDefault,
      },
    });
  };
  const closeEdit = () => {
    setEditing(null);
    setError(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    setError(null);
    try {
      const url = editing.id
        ? `/api/account/addresses/${editing.id}`
        : "/api/account/addresses";
      const method = editing.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Không lưu được");
        return;
      }
      await refreshList();
      setEditing(null);
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusy(false);
    }
  };

  const refreshList = async () => {
    const res = await fetch("/api/account/addresses");
    if (res.ok) {
      const data = await res.json();
      setItems(data.addresses ?? []);
    }
    router.refresh();
  };

  const onDelete = async (id: string) => {
    if (busy) return;
    if (!window.confirm("Xoá địa chỉ này?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Không xoá được");
        return;
      }
      await refreshList();
    } finally {
      setBusy(false);
    }
  };

  const setDefault = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/account/addresses/${id}/default`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("Không đặt mặc định được");
        return;
      }
      await refreshList();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:brightness-110"
        >
          <span className="text-[16px] leading-none">+</span>
          Thêm địa chỉ
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-6 py-12 text-center">
          <p className="text-[15px] font-semibold text-[var(--color-text)]">
            Chưa có địa chỉ nào
          </p>
          <p className="mt-2 text-[13px] text-[var(--color-text-dim)]">
            Thêm địa chỉ để dùng khi đặt hàng.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-[var(--color-border)] bg-white p-5 transition hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[15px] font-semibold text-[var(--color-text)]">
                      {a.recipientName}
                    </span>
                    <span className="text-[13px] text-[var(--color-text-dim)]">
                      · {a.phone}
                    </span>
                    {a.isDefault && (
                      <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[14px] text-[var(--color-text)]">
                    {a.addressLine}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
                    {a.ward}, {a.district}, {a.province}
                  </p>
                  {a.note && (
                    <p className="mt-2 text-[13px] text-[var(--color-text-dim)]">
                      <span className="font-medium">Ghi chú:</span> {a.note}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {!a.isDefault && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setDefault(a.id)}
                      className="rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
                    >
                      Mặc định
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openEdit(a)}
                    className="rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDelete(a.id)}
                    className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-[12px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && !editing && (
        <div role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-700">
          {error}
        </div>
      )}

      {editing && (
        <AddressModal
          title={editing.id ? "Sửa địa chỉ" : "Thêm địa chỉ"}
          data={editing.data}
          onChange={(next) =>
            setEditing((prev) => (prev ? { ...prev, data: next } : prev))
          }
          onCancel={closeEdit}
          onSubmit={save}
          busy={busy}
          error={error}
          onlyOne={items.length === 0}
        />
      )}
    </div>
  );
}

function AddressModal({
  title,
  data,
  onChange,
  onCancel,
  onSubmit,
  busy,
  error,
  onlyOne,
}: {
  title: string;
  data: AddressInput;
  onChange: (next: AddressInput) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
  error: string | null;
  onlyOne: boolean;
}) {
  const set = <K extends keyof AddressInput>(k: K, v: AddressInput[K]) =>
    onChange({ ...data, [k]: v });

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="text-[18px] font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Họ và tên người nhận" required>
              <input
                value={data.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
                required
                maxLength={100}
                className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
              />
            </Labeled>
            <Labeled label="Số điện thoại" required>
              <input
                value={data.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\s+/g, ""))}
                placeholder="0912345678"
                inputMode="tel"
                required
                className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
              />
            </Labeled>
          </div>
          <Labeled label="Tỉnh/Thành phố" required>
            <input
              value={data.province}
              onChange={(e) => set("province", e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
            />
          </Labeled>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Quận/Huyện" required>
              <input
                value={data.district}
                onChange={(e) => set("district", e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
              />
            </Labeled>
            <Labeled label="Phường/Xã" required>
              <input
                value={data.ward}
                onChange={(e) => set("ward", e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
              />
            </Labeled>
          </div>
          <Labeled label="Địa chỉ (số nhà, tên đường)" required>
            <input
              value={data.addressLine}
              onChange={(e) => set("addressLine", e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition"
            />
          </Labeled>
          <Labeled label="Ghi chú cho shipper (tuỳ chọn)">
            <textarea
              value={data.note ?? ""}
              onChange={(e) => set("note", e.target.value || null)}
              rows={2}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[14px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition resize-none"
            />
          </Labeled>
          <label className="flex items-center gap-2.5 text-[14px] text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={data.isDefault || onlyOne}
              disabled={onlyOne}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="h-4 w-4 rounded accent-[var(--color-accent)]"
            />
            Đặt làm địa chỉ mặc định
            {onlyOne && (
              <span className="text-[12px] text-[var(--color-text-dim)]">
                (địa chỉ đầu tiên sẽ tự đặt mặc định)
              </span>
            )}
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-[var(--color-border)] bg-white px-5 py-2.5 text-[14px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Labeled({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline gap-1.5 text-[13px] font-semibold text-[var(--color-text)]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
