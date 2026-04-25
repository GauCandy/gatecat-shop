"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đang chuẩn bị hàng" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "returned", label: "Hoàn hàng" },
  { value: "cancelled", label: "Đã huỷ" },
] as const;

export function ShipperOrderEditor({
  orderId,
  initialStatus,
  initialTrackingCode,
}: {
  orderId: string;
  initialStatus: string;
  initialTrackingCode: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const dirty =
    status !== initialStatus || trackingCode !== (initialTrackingCode ?? "");

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingCode: trackingCode.trim() === "" ? null : trackingCode.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data?.error ?? "Lưu thất bại" });
        return;
      }
      setMessage({ type: "ok", text: "Đã lưu thay đổi" });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Lỗi kết nối" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-5">
      <h2 className="text-[14px] font-bold text-[var(--color-text)]">
        Cập nhật trạng thái
      </h2>

      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[var(--color-text-dim)]">
            Trạng thái
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setMessage(null);
            }}
            disabled={saving}
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-2 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium text-[var(--color-text-dim)]">
            Mã vận chuyển
          </label>
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => {
              setTrackingCode(e.target.value);
              setMessage(null);
            }}
            placeholder="Để trống để xoá"
            disabled={saving}
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        <button
          type="button"
          disabled={!dirty || saving}
          onClick={handleSave}
          className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : dirty ? "Lưu thay đổi" : "Chưa thay đổi"}
        </button>

        {message && (
          <p
            className={`text-[12px] ${
              message.type === "ok" ? "text-green-700" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
