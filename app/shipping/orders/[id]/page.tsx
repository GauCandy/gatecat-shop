import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderForShipper } from "@/lib/orders";
import { ShipperOrderEditor } from "@/components/ShipperOrderEditor";

export const dynamic = "force-dynamic";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(d));

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đang chuẩn bị hàng", color: "bg-blue-100 text-blue-700" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  returned: { label: "Hoàn hàng", color: "bg-orange-100 text-orange-700" },
  cancelled: { label: "Đã huỷ", color: "bg-gray-200 text-gray-700" },
};

export default async function ShipperOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderForShipper(id);
  if (!order) notFound();

  const badge = STATUS_BADGE[order.status];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[12px] text-[var(--color-text-dim)]">
          <Link href="/shipping/all" className="hover:text-[var(--color-text)]">
            Tất cả đơn hàng
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text)]">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Đơn #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          {badge && (
            <span
              className={`whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold ${badge.color}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
          Đặt lúc {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-[var(--color-border-strong)] bg-white p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-bold text-[var(--color-text)]">
                {order.deliveryMethod === "pickup"
                  ? "Khách đến lấy tại shop"
                  : "Địa chỉ giao hàng"}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  order.deliveryMethod === "pickup"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {order.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
              </span>
            </div>
            <div className="mt-3 space-y-0.5">
              {order.recipientName && (
                <p className="text-[14px] font-semibold text-[var(--color-text)]">
                  {order.recipientName}
                </p>
              )}
              {order.phone && (
                <p className="text-[13px] text-[var(--color-text)]">
                  <a
                    href={`tel:${order.phone}`}
                    className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                  >
                    {order.phone}
                  </a>
                </p>
              )}
              {order.deliveryMethod === "pickup" ? (
                <p className="mt-2 text-[13px] italic text-[var(--color-text-dim)]">
                  Đơn lấy tại shop — không cần giao đến địa chỉ.
                </p>
              ) : (
                <>
                  {order.addressLine && (
                    <p className="mt-2 text-[13px] text-[var(--color-text)]">
                      {order.addressLine}
                    </p>
                  )}
                  {(order.ward || order.district || order.province) && (
                    <p className="text-[12px] text-[var(--color-text-dim)]">
                      {[order.ward, order.district, order.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </>
              )}
              {order.note && (
                <p className="mt-2 text-[12px] text-[var(--color-text-dim)]">
                  <span className="font-medium">Ghi chú của khách:</span> {order.note}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[var(--color-border-strong)] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[var(--color-text)]">
                Sản phẩm trong kiện
              </h2>
              <span className="text-[12px] text-[var(--color-text-dim)]">
                {order.items?.length ?? 0} sản phẩm
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] p-3"
                >
                  {item.variantImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.variantImageUrl}
                      alt={item.productName}
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 shrink-0 rounded-md border border-[var(--color-border)] object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-md bg-[var(--color-surface-2)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[var(--color-text)]">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-dim)]">
                      Mã: {item.variantSku}
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--color-text)]">
                      {formatVnd(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-[13px] font-semibold text-[var(--color-text)]">
                    {formatVnd(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[var(--color-border)] pt-3 space-y-1 text-[13px]">
              <div className="flex justify-between text-[var(--color-text-dim)]">
                <span>Tạm tính</span>
                <span className="text-[var(--color-text)]">
                  {formatVnd(order.totalAmount + order.discountAmount)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>
                    Voucher
                    {order.voucherCode && (
                      <span className="ml-1 font-mono">{order.voucherCode}</span>
                    )}
                  </span>
                  <span>-{formatVnd(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--color-text-dim)]">
                <span>Phương thức</span>
                <span className="text-[var(--color-text)]">
                  {order.paymentMethod === "cod"
                    ? "COD - Thu hộ khi giao"
                    : order.paymentMethod}
                </span>
              </div>
              <div className="mt-1 flex justify-between border-t border-[var(--color-border)] pt-2">
                <span className="font-bold text-[var(--color-text)]">Tổng thu</span>
                <span className="text-[15px] font-bold text-[var(--color-text)]">
                  {formatVnd(order.totalAmount)}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <ShipperOrderEditor
            orderId={order.id}
            initialStatus={order.status}
            initialTrackingCode={order.trackingCode ?? null}
          />
          {order.trackingCode && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
                Mã vận chuyển hiện tại
              </p>
              <p className="mt-1 font-mono text-[14px] text-[var(--color-text)]">
                {order.trackingCode}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
