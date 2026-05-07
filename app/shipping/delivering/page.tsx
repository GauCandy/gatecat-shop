import { pool } from "@/lib/db";
import type { ShipperOrderRow } from "@/lib/orders";
import { DeliveringOrdersClient } from "@/components/DeliveringOrdersClient";

export const dynamic = "force-dynamic";

export default async function ShippingDeliveringPage() {
  const result = await pool.query<ShipperOrderRow>(
    `
    SELECT
      id,
      user_id as "userId",
      recipient_name as "recipientName",
      phone,
      address_line as "addressLine",
      province,
      district,
      ward,
      total_amount as "totalAmount",
      status,
      delivery_method::text as "deliveryMethod",
      tracking_code as "trackingCode",
      created_at as "createdAt"
    FROM orders
    WHERE status = 'shipping'
    ORDER BY created_at ASC
    `
  );

  const orders = result.rows;

  return (
    <div className="flex flex-col gap-6 text-zinc-100">
      <div className="border-b-2 border-zinc-800 pb-4">
        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ QUEUE · 04 · IN TRANSIT
        </p>
        <h1 className="mt-2 text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
          Đang giao<span className="text-orange-500">.</span>
        </h1>
        <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Chọn chế độ rồi quét mã để cập nhật giao thành công / hoàn hàng.
        </p>
      </div>
      <DeliveringOrdersClient orders={orders} />
    </div>
  );
}
