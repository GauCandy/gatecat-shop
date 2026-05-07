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
    <div className="relative border-2 border-orange-500/60 bg-zinc-900 p-5 shadow-[6px_6px_0_#09090b]">
      <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
      <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
      <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
      <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

      <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
        ⬢ STATUS UPDATE
      </p>
      <h2 className="mt-2 text-[16px] font-black uppercase tracking-tight text-zinc-100">
        Cập nhật trạng thái<span className="text-orange-500">.</span>
      </h2>

      <div className="mt-5 space-y-3 border-t-2 border-zinc-800 pt-4">
        <div>
          <label className="mc-mono mb-2 block text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ TRẠNG THÁI
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setMessage(null);
            }}
            disabled={saving}
            className="mc-mono h-10 w-full border-2 border-zinc-700 bg-zinc-950 px-2 text-[12px] font-bold uppercase tracking-[0.1em] text-zinc-100 focus:border-orange-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mc-mono mb-2 block text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ TRACKING CODE
          </label>
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => {
              setTrackingCode(e.target.value);
              setMessage(null);
            }}
            placeholder="ĐỂ TRỐNG ĐỂ XOÁ"
            disabled={saving}
            className="mc-mono h-10 w-full border-2 border-zinc-700 bg-zinc-950 px-3 text-[12px] font-bold uppercase tracking-[0.1em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <button
          type="button"
          disabled={!dirty || saving}
          onClick={handleSave}
          className="mc-btn-primary mc-btn-primary-lg w-full justify-center disabled:opacity-50"
        >
          ⬢ {saving ? "ĐANG LƯU..." : dirty ? "LƯU THAY ĐỔI" : "KHÔNG ĐỔI"}
        </button>

        {message && (
          <p
            className={`mc-mono border-2 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${
              message.type === "ok"
                ? "border-green-500/60 bg-green-500/10 text-green-300"
                : "border-red-500/60 bg-red-500/10 text-red-300"
            }`}
          >
            ⬢ {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
