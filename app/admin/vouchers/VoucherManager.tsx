"use client";

import { useState } from "react";
import type { Voucher, VoucherInput } from "@/lib/vouchers";
import { toast } from "@/components/Toaster";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (d: Date | null) =>
  d
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(d)
      )
    : "—";

type FormState = {
  id: string | null;
  code: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  discountType: "percent" | "amount";
  discountValue: string;
  maxDiscount: string;
  minOrderTotal: string;
  usageLimit: string;
  expiresAt: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  code: "",
  name: "",
  description: "",
  visibility: "public",
  discountType: "percent",
  discountValue: "",
  maxDiscount: "",
  minOrderTotal: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

function toLocalInputValue(d: Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function toFormState(v: Voucher): FormState {
  return {
    id: v.id,
    code: v.code,
    name: v.name,
    description: v.description ?? "",
    visibility: v.visibility,
    discountType: v.discountType,
    discountValue: String(v.discountValue),
    maxDiscount: v.maxDiscount != null ? String(v.maxDiscount) : "",
    minOrderTotal: v.minOrderTotal != null ? String(v.minOrderTotal) : "",
    usageLimit: v.usageLimit != null ? String(v.usageLimit) : "",
    expiresAt: toLocalInputValue(v.expiresAt),
    isActive: v.isActive,
  };
}

function describeDiscount(v: Voucher): string {
  if (v.discountType === "percent") {
    const cap = v.maxDiscount ? ` (tối đa ${formatVnd(v.maxDiscount)})` : "";
    return `-${v.discountValue}%${cap}`;
  }
  return `-${formatVnd(v.discountValue)}`;
}

function describeStatus(v: Voucher): { label: string; color: string } {
  if (!v.isActive) return { label: "Đã tắt", color: "bg-zinc-800 text-zinc-300" };
  if (v.expiresAt && v.expiresAt.getTime() <= Date.now())
    return { label: "Hết hạn", color: "bg-red-500/15 text-red-300" };
  if (v.usageLimit != null && v.usedCount >= v.usageLimit)
    return { label: "Hết lượt", color: "bg-orange-500/15 text-orange-300" };
  return { label: "Đang hoạt động", color: "bg-green-500/15 text-green-300" };
}

export function VoucherManager({ initial }: { initial: Voucher[] }) {
  const [vouchers, setVouchers] = useState(initial);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setOpen(true);
  };

  const startEdit = (v: Voucher) => {
    setForm(toFormState(v));
    setError(null);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: VoucherInput = {
        code: form.code,
        name: form.name,
        description: form.description || null,
        visibility: form.visibility,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrderTotal: form.minOrderTotal ? Number(form.minOrderTotal) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,
        isActive: form.isActive,
      };

      const res = await fetch(
        form.id ? `/api/admin/vouchers/${form.id}` : "/api/admin/vouchers",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Lỗi");
        return;
      }
      const saved: Voucher = {
        ...data.voucher,
        expiresAt: data.voucher.expiresAt ? new Date(data.voucher.expiresAt) : null,
        createdAt: new Date(data.voucher.createdAt),
        updatedAt: new Date(data.voucher.updatedAt),
      };
      setVouchers((list) =>
        form.id ? list.map((v) => (v.id === saved.id ? saved : v)) : [saved, ...list]
      );
      toast(form.id ? `Đã cập nhật voucher ${saved.code}` : `Đã tạo voucher ${saved.code}`, "success");
      close();
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (v: Voucher) => {
    if (!confirm(`Xoá voucher "${v.code}"? Lịch sử sử dụng cũng sẽ bị xoá.`)) return;
    const res = await fetch(`/api/admin/vouchers/${v.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data?.error ?? "Xoá thất bại", "error");
      return;
    }
    setVouchers((list) => list.filter((x) => x.id !== v.id));
    toast(`Đã xoá voucher ${v.code}`, "success");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--color-text-dim)]">
          {vouchers.length} voucher
        </span>
        <button
          type="button"
          onClick={startCreate}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110"
        >
          + Tạo voucher
        </button>
      </div>

      {vouchers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-10 text-center">
          <p className="text-[14px] font-medium text-[var(--color-text)]">Chưa có voucher nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-zinc-900">
          <table className="min-w-full text-[13px]">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] text-[12px] uppercase tracking-wider text-[var(--color-text-dim)]">
              <tr>
                <th className="px-3 py-2 text-left">Mã</th>
                <th className="px-3 py-2 text-left">Tên</th>
                <th className="px-3 py-2 text-left">Loại</th>
                <th className="px-3 py-2 text-right">Giảm</th>
                <th className="px-3 py-2 text-right">Lượt</th>
                <th className="px-3 py-2 text-left">Hết hạn</th>
                <th className="px-3 py-2 text-left">Trạng thái</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => {
                const status = describeStatus(v);
                return (
                  <tr key={v.id} className="border-b border-[var(--color-border)] last:border-b-0">
                    <td className="px-3 py-2 font-mono font-semibold text-[var(--color-text)]">
                      {v.code}
                    </td>
                    <td className="px-3 py-2 text-[var(--color-text)]">{v.name}</td>
                    <td className="px-3 py-2 text-[var(--color-text-dim)]">
                      {v.visibility === "public" ? "Công khai" : "Riêng tư"}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--color-text)]">
                      {describeDiscount(v)}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">
                      {v.usedCount}
                      {v.usageLimit != null ? ` / ${v.usageLimit}` : ""}
                    </td>
                    <td className="px-3 py-2 text-[var(--color-text-dim)]">
                      {formatDate(v.expiresAt)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(v)}
                        className="mr-2 rounded-md border border-[var(--color-border)] px-2 py-1 text-[12px] transition hover:bg-[var(--color-surface-2)]"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        className="rounded-md border border-red-500/40 px-2 py-1 text-[12px] text-red-400 transition hover:bg-red-500/10"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-zinc-900 shadow-xl">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-[var(--color-text)]">
                  {form.id ? "Sửa voucher" : "Tạo voucher mới"}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Đóng"
                  className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Field label="Mã voucher *">
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="SALE50"
                    className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] font-mono uppercase focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                </Field>

                <Field label="Tên hiển thị *">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Giảm 50% mừng sinh nhật"
                    className={inputCls}
                  />
                </Field>

                <Field label="Kiểu hiển thị">
                  <select
                    value={form.visibility}
                    onChange={(e) =>
                      setForm({ ...form, visibility: e.target.value as "public" | "private" })
                    }
                    className={inputCls}
                  >
                    <option value="public">Công khai (hiện trên trang thanh toán)</option>
                    <option value="private">Riêng tư (phải nhập mã)</option>
                  </select>
                </Field>

                <Field label="Loại giảm">
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountType: e.target.value as "percent" | "amount",
                      })
                    }
                    className={inputCls}
                  >
                    <option value="percent">Theo % đơn</option>
                    <option value="amount">Số tiền cố định</option>
                  </select>
                </Field>

                <Field label={form.discountType === "percent" ? "Giảm (%)" : "Giảm (VND)"}>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className={inputCls}
                  />
                </Field>

                <Field
                  label={
                    form.discountType === "percent" ? "Mức giảm tối đa (VND)" : "Không áp dụng"
                  }
                >
                  <input
                    type="number"
                    min={0}
                    value={form.maxDiscount}
                    disabled={form.discountType !== "percent"}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    className={inputCls}
                  />
                </Field>

                <Field label="Đơn tối thiểu (VND)">
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderTotal}
                    onChange={(e) => setForm({ ...form, minOrderTotal: e.target.value })}
                    className={inputCls}
                  />
                </Field>

                <Field label="Tổng lượt sử dụng (để trống = không giới hạn)">
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className={inputCls}
                  />
                </Field>

                <Field label="Hết hạn (để trống = vô hạn)">
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className={inputCls}
                  />
                </Field>

                <Field label="Trạng thái">
                  <label className="flex h-10 items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                    <span className="text-[13px] text-[var(--color-text)]">
                      Đang hoạt động
                    </span>
                  </label>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Mô tả (tuỳ chọn)">
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 py-2 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                  </Field>
                </div>
              </div>

              {error && (
                <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                  {error}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={busy}
                  className="rounded-lg border border-[var(--color-border)] bg-zinc-900 px-4 py-2 text-[13px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  {busy ? "Đang lưu..." : form.id ? "Lưu" : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-[var(--color-border)] bg-zinc-900 px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:bg-[var(--color-surface-2)] disabled:text-[var(--color-text-dim)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-[var(--color-text-dim)]">{label}</span>
      {children}
    </label>
  );
}
