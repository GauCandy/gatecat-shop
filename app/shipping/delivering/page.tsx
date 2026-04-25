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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Đang giao</h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Chọn chế độ rồi quét mã vận chuyển để cập nhật trạng thái giao thành công hoặc hoàn hàng.
        </p>
      </div>
      <DeliveringOrdersClient orders={orders} />
    </div>
  );
}
