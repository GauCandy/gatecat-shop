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

const FIELD_INPUT =
  "mc-mono h-11 w-full border-2 border-zinc-700 bg-zinc-950 px-3.5 text-[13px] font-bold uppercase tracking-[0.04em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition";

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
          className="mc-btn-primary mc-btn-primary-lg"
        >
          ⬢ THÊM ĐỊA CHỈ
        </button>
      </div>

      {items.length === 0 ? (
        <div className="relative border-2 border-dashed border-zinc-700 bg-zinc-900 px-6 py-12 text-center">
          <span className="mc-rivet mc-rivet-tl" />
          <span className="mc-rivet mc-rivet-tr" />
          <span className="mc-rivet mc-rivet-bl" />
          <span className="mc-rivet mc-rivet-br" />
          <p className="text-[15px] font-black uppercase tracking-tight text-zinc-100">
            ⬢ CHƯA CÓ DEPLOY POINT
          </p>
          <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            ▸ Thêm địa chỉ để dùng khi đặt hàng.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="relative border-2 border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700"
            >
              <span className="mc-rivet mc-rivet-tl" />
              <span className="mc-rivet mc-rivet-tr" />
              <span className="mc-rivet mc-rivet-bl" />
              <span className="mc-rivet mc-rivet-br" />

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[15px] font-black uppercase tracking-tight text-zinc-100">
                      {a.recipientName}
                    </span>
                    <span className="mc-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                      · {a.phone}
                    </span>
                    {a.isDefault && (
                      <span className="mc-tag-warning">
                        ⬢ MẶC ĐỊNH
                      </span>
                    )}
                  </div>
                  <p className="mc-mono mt-3 text-[12px] uppercase tracking-[0.08em] text-zinc-200">
                    ▸ {a.addressLine}
                  </p>
                  <p className="mc-mono mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    {a.ward}, {a.district}, {a.province}
                  </p>
                  {a.note && (
                    <p className="mc-mono mt-3 border-t-2 border-zinc-800 pt-3 text-[11px] uppercase tracking-[0.12em] text-zinc-400">
                      <span className="font-black text-orange-400">NOTE ▸</span> {a.note}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {!a.isDefault && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setDefault(a.id)}
                      className="mc-btn-outline disabled:opacity-50"
                    >
                      ⬢ ĐẶT MẶC ĐỊNH
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openEdit(a)}
                    className="mc-btn-outline disabled:opacity-50"
                  >
                    / SỬA
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDelete(a.id)}
                    className="mc-mono inline-flex items-center gap-1 border-2 border-red-500/50 bg-zinc-950 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-red-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                  >
                    ✕ XOÁ
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && !editing && (
        <div role="alert" className="mc-mono border-2 border-red-500/60 bg-red-500/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-red-300">
          ⬢ ERR · {error}
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
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-lg border-2 border-orange-500/60 bg-zinc-900 p-6 shadow-[8px_8px_0_#09090b]"
      >
        <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

        <div className="mb-5 flex items-center justify-between border-b-2 border-zinc-800 pb-3">
          <h2 className="text-[18px] font-black uppercase tracking-tight text-zinc-100">
            ⬢ {title}<span className="text-orange-500">.</span>
          </h2>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Họ và tên người nhận" required>
              <input
                value={data.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
                required
                maxLength={100}
                className={FIELD_INPUT}
              />
            </Labeled>
            <Labeled label="Số điện thoại" required>
              <input
                value={data.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\s+/g, ""))}
                placeholder="0912345678"
                inputMode="tel"
                required
                className={FIELD_INPUT}
              />
            </Labeled>
          </div>
          <Labeled label="Tỉnh/Thành phố" required>
            <input
              value={data.province}
              onChange={(e) => set("province", e.target.value)}
              required
              className={FIELD_INPUT}
            />
          </Labeled>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Quận/Huyện" required>
              <input
                value={data.district}
                onChange={(e) => set("district", e.target.value)}
                required
                className={FIELD_INPUT}
              />
            </Labeled>
            <Labeled label="Phường/Xã" required>
              <input
                value={data.ward}
                onChange={(e) => set("ward", e.target.value)}
                required
                className={FIELD_INPUT}
              />
            </Labeled>
          </div>
          <Labeled label="Địa chỉ (số nhà, tên đường)" required>
            <input
              value={data.addressLine}
              onChange={(e) => set("addressLine", e.target.value)}
              required
              className={FIELD_INPUT}
            />
          </Labeled>
          <Labeled label="Ghi chú cho shipper (tuỳ chọn)">
            <textarea
              value={data.note ?? ""}
              onChange={(e) => set("note", e.target.value || null)}
              rows={2}
              className="mc-mono w-full resize-none border-2 border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-[12px] uppercase tracking-[0.04em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition"
            />
          </Labeled>
          <label className="mc-mono flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-300">
            <input
              type="checkbox"
              checked={data.isDefault || onlyOne}
              disabled={onlyOne}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            ⬢ ĐẶT LÀM ĐỊA CHỈ MẶC ĐỊNH
            {onlyOne && (
              <span className="text-[10px] font-normal text-zinc-500">
                (địa chỉ đầu tiên tự mặc định)
              </span>
            )}
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="mc-mono mt-4 border-2 border-red-500/60 bg-red-500/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-red-300"
          >
            ⬢ ERR · {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t-2 border-zinc-800 pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="mc-btn-outline disabled:opacity-50"
          >
            ✕ HUỶ
          </button>
          <button
            type="submit"
            disabled={busy}
            className="mc-btn-primary mc-btn-primary-lg disabled:opacity-60"
          >
            ⬢ {busy ? "ĐANG LƯU..." : "LƯU"}
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
      <span className="mc-mono mb-2 flex items-baseline gap-1.5 text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
        ⬢ {label}
        {required && <span className="text-yellow-400">*</span>}
      </span>
      {children}
    </label>
  );
}
