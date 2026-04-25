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
      className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-5 py-3 text-[13px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {busy ? "Đang huỷ..." : "Huỷ đơn"}
    </button>
  );
}
