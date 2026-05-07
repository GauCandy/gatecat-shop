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
  pending: { label: "PENDING", color: "border-yellow-500/60 bg-yellow-500/10 text-yellow-300" },
  confirmed: { label: "PREPARING", color: "border-cyan-500/60 bg-cyan-500/10 text-cyan-300" },
  shipping: { label: "IN TRANSIT", color: "border-purple-500/60 bg-purple-500/10 text-purple-300" },
  delivered: { label: "DELIVERED", color: "border-green-500/60 bg-green-500/10 text-green-300" },
  returned: { label: "RETURNED", color: "border-orange-500/60 bg-orange-500/10 text-orange-300" },
  cancelled: { label: "CANCELLED", color: "border-zinc-700 bg-zinc-800 text-zinc-400" },
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
    <div className="flex flex-col gap-6 text-zinc-100">
      <div className="border-b-2 border-zinc-800 pb-4">
        <div className="mc-mono mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
          <Link href="/shipping/all" className="hover:text-orange-400">
            ▸ Tất cả đơn hàng
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="font-black text-orange-400">
            ⬢ ORD#{order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[22px] font-black uppercase tracking-tight sm:text-[28px]">
            ORD#{order.id.slice(0, 8).toUpperCase()}<span className="text-orange-500">.</span>
          </h1>
          {badge && (
            <span
              className={`mc-mono whitespace-nowrap border-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${badge.color}`}
            >
              ⬢ {badge.label}
            </span>
          )}
        </div>
        <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ▸ Đặt lúc {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="relative border-2 border-zinc-700 bg-zinc-900 p-5">
            <span className="mc-rivet mc-rivet-tl" />
            <span className="mc-rivet mc-rivet-tr" />
            <span className="mc-rivet mc-rivet-bl" />
            <span className="mc-rivet mc-rivet-br" />

            <div className="mb-3 flex flex-wrap items-center gap-2 border-b-2 border-zinc-800 pb-3">
              <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
                ⬢ {order.deliveryMethod === "pickup"
                  ? "PICKUP DEPOT"
                  : "DEPLOY POINT"}
              </p>
              <span
                className={`mc-mono border-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] ${
                  order.deliveryMethod === "pickup"
                    ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                    : "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                }`}
              >
                {order.deliveryMethod === "pickup" ? "PICKUP" : "DELIVERY"}
              </span>
            </div>
            <div className="space-y-1">
              {order.recipientName && (
                <p className="text-[14px] font-black uppercase tracking-tight">
                  {order.recipientName}
                </p>
              )}
              {order.phone && (
                <p className="mc-mono text-[12px] uppercase tracking-[0.15em] text-zinc-300">
                  ▸ <a
                    href={`tel:${order.phone}`}
                    className="text-orange-400 underline-offset-2 hover:underline"
                  >
                    {order.phone}
                  </a>
                </p>
              )}
              {order.deliveryMethod === "pickup" ? (
                <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  ▸ Đơn lấy tại shop — không cần giao đến địa chỉ.
                </p>
              ) : (
                <>
                  {order.addressLine && (
                    <p className="mc-mono mt-2 text-[12px] uppercase tracking-[0.08em] text-zinc-300">
                      ▸ {order.addressLine}
                    </p>
                  )}
                  {(order.ward || order.district || order.province) && (
                    <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {[order.ward, order.district, order.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </>
              )}
              {order.note && (
                <p className="mc-mono mt-3 border-t-2 border-zinc-800 pt-3 text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                  <span className="font-black text-orange-400">NOTE ▸</span> {order.note}
                </p>
              )}
            </div>
          </section>

          <section className="relative border-2 border-zinc-700 bg-zinc-900 p-5">
            <span className="mc-rivet mc-rivet-tl" />
            <span className="mc-rivet mc-rivet-tr" />
            <span className="mc-rivet mc-rivet-bl" />
            <span className="mc-rivet mc-rivet-br" />

            <div className="mb-3 flex items-center justify-between border-b-2 border-zinc-800 pb-3">
              <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
                ⬢ CARGO MANIFEST
              </p>
              <span className="mc-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                {order.items?.length ?? 0} UNIT
              </span>
            </div>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-2 border-zinc-800 bg-zinc-950 p-3"
                >
                  {item.variantImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.variantImageUrl}
                      alt={item.productName}
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 shrink-0 border-2 border-zinc-700 object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 border-2 border-zinc-700 bg-zinc-900" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black uppercase tracking-tight">
                      {item.productName}
                    </p>
                    <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      ▸ SN: {item.variantSku}
                    </p>
                    <p className="mc-mono mt-1 text-[11px] uppercase tracking-[0.08em] text-zinc-300">
                      {formatVnd(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="mc-mono whitespace-nowrap text-[13px] font-black text-orange-400">
                    {formatVnd(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t-2 border-zinc-800 pt-3 mc-mono space-y-1 text-[11px] uppercase tracking-[0.15em]">
              <div className="flex justify-between">
                <span className="text-zinc-500">▸ Tạm tính</span>
                <span className="font-bold text-zinc-100">
                  {formatVnd(order.totalAmount + order.discountAmount)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    ▸ Voucher
                    {order.voucherCode && (
                      <span className="ml-1 text-orange-400">{order.voucherCode}</span>
                    )}
                  </span>
                  <span className="font-bold text-green-400">−{formatVnd(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">▸ Payment</span>
                <span className="font-bold text-zinc-100">
                  {order.paymentMethod === "cod"
                    ? "COD · THU HỘ"
                    : order.paymentMethod}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t-2 border-zinc-800 pt-3">
                <span className="text-[12px] font-black tracking-[0.22em] text-orange-500">⬢ TỔNG THU</span>
                <span className="text-[18px] font-black text-orange-400">
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
            <div className="relative border-2 border-zinc-800 bg-zinc-950 p-4">
              <span className="mc-rivet mc-rivet-tl" />
              <span className="mc-rivet mc-rivet-tr" />
              <span className="mc-rivet mc-rivet-bl" />
              <span className="mc-rivet mc-rivet-br" />
              <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
                ⬢ TRACKING CODE
              </p>
              <p className="mc-mono mt-2 text-[14px] font-black tracking-[0.05em] text-zinc-100">
                {order.trackingCode}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
