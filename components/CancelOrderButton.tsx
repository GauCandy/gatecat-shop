"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toaster";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Huỷ đơn này? Sản phẩm sẽ được hoàn về kho.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data?.error ?? "Huỷ thất bại", "error");
        return;
      }
      toast("Đã huỷ đơn hàng. Hàng sẽ được hoàn về kho.", "success");
      router.refresh();
    } catch {
      toast("Lỗi kết nối", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleCancel}
      className="mc-mono inline-flex items-center justify-center gap-1 border-2 border-red-500/60 bg-zinc-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-red-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300 hover:shadow-[3px_3px_0_#09090b] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50"
    >
      ✕ {busy ? "ĐANG HUỶ..." : "HUỶ ĐƠN"}
    </button>
  );
}
