import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE, getSessionUser } from "@/lib/session";
import { getOrder } from "@/lib/orders";
import { listReviewableProductsForOrder } from "@/lib/reviews";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { OrderReviewSection } from "@/components/OrderReviewSection";
import { SHOP_INFO, shopFullAddress } from "@/lib/shop";

export const dynamic = "force-dynamic";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(d));

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "PENDING", color: "border-yellow-500/60 bg-yellow-500/10 text-yellow-300" },
  confirmed: { label: "PREPARING", color: "border-cyan-500/60 bg-cyan-500/10 text-cyan-300" },
  shipping: { label: "IN TRANSIT", color: "border-purple-500/60 bg-purple-500/10 text-purple-300" },
  delivered: { label: "DELIVERED", color: "border-green-500/60 bg-green-500/10 text-green-300" },
  returned: { label: "RETURNED", color: "border-orange-500/60 bg-orange-500/10 text-orange-300" },
  cancelled: { label: "CANCELLED", color: "border-zinc-700 bg-zinc-800 text-zinc-400" },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("/login");

  const { id } = await params;
  let order;
  try {
    order = await getOrder(user.id, id);
  } catch {
    redirect("/orders");
  }

  const reviewableProducts =
    order.status === "delivered"
      ? await listReviewableProductsForOrder(user.id, order.id).catch(() => [])
      : [];

  const status = STATUS_LABELS[order.status];

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            breadcrumbs={[
              { href: "/orders", label: "Đơn hàng" },
              { label: `#${order.id.slice(0, 8).toUpperCase()}` },
            ]}
            title={`Đơn ORD#${order.id.slice(0, 8).toUpperCase()}`}
            description={`Chi tiết dispatch — ${formatDate(order.createdAt)}`}
          />

          <div className="relative border-2 border-zinc-700 bg-zinc-900 p-6">
            <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
            <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

            <div className="mb-6 flex items-start justify-between gap-4 border-b-2 border-zinc-800 pb-5">
              <div>
                <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
                  ⬢ DISPATCH STATUS
                </p>
                <p className="mc-mono mt-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  ▸ {formatDate(order.createdAt)}
                </p>
              </div>
              {status && (
                <span
                  className={`mc-mono whitespace-nowrap border-2 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] ${status.color}`}
                >
                  ⬢ {status.label}
                </span>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
                  ⬢ {order.deliveryMethod === "pickup"
                    ? "PICKUP DEPOT"
                    : "DEPLOY POINT"}
                </h2>
                <div className="mt-2 border-2 border-zinc-800 bg-zinc-950 p-3">
                  {order.deliveryMethod === "pickup" ? (
                    <>
                      <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
                        {SHOP_INFO.name}
                      </p>
                      <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        ▸ {SHOP_INFO.phone}
                      </p>
                      <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.08em] text-zinc-300">
                        {shopFullAddress()}
                      </p>
                      <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        OPEN: <span className="text-orange-400">{SHOP_INFO.hours}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
                        {order.recipientName}
                      </p>
                      <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        ▸ {order.phone}
                      </p>
                      <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.08em] text-zinc-300">
                        {order.addressLine}
                      </p>
                      <p className="mc-mono mt-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {order.ward}, {order.district}, {order.province}
                      </p>
                      {order.note && (
                        <p className="mc-mono mt-2 text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                          <span className="font-black text-orange-400">NOTE ▸</span> {order.note}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2 className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
                  ⬢ DELIVERY · PAYMENT
                </h2>
                <div className="mt-2 border-2 border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
                    ⬢ {order.deliveryMethod === "pickup"
                      ? "LẤY TẠI SHOP"
                      : "GIAO TẬN NƠI"}
                  </p>
                  <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.15em] text-zinc-300">
                    ▸ COD · Thanh toán khi nhận
                  </p>
                  <p className="mc-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {order.deliveryMethod === "pickup"
                      ? "Thanh toán tại quầy khi đến lấy."
                      : "Chuẩn bị tiền mặt cho shipper."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t-2 border-zinc-800 pt-6">
              <h2 className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
                ⬢ CARGO · CHI TIẾT SẢN PHẨM
              </h2>
              <div className="mt-4 space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between border-2 border-zinc-800 bg-zinc-950 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-black uppercase tracking-tight text-zinc-100">
                        {item.productName}
                      </p>
                      <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        ▸ SN: {item.variantSku}
                      </p>
                      <p className="mc-mono mt-1 text-[11px] uppercase tracking-[0.08em] text-zinc-300">
                        {formatVnd(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right">
                      <p className="mc-mono text-[14px] font-black text-orange-400">
                        {formatVnd(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t-2 border-zinc-800 pt-6">
              <dl className="mc-mono space-y-2 text-[11px] uppercase tracking-[0.15em]">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">▸ Tạm tính</dt>
                  <dd className="font-bold text-zinc-100">
                    {formatVnd(order.totalAmount + order.discountAmount)}
                  </dd>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">
                      ▸ Voucher
                      {order.voucherCode && (
                        <span className="ml-1 text-orange-400">{order.voucherCode}</span>
                      )}
                    </dt>
                    <dd className="font-bold text-green-400">−{formatVnd(order.discountAmount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-zinc-500">▸ Phí ship</dt>
                  <dd className="font-bold text-green-400">Miễn phí</dd>
                </div>
                <div className="flex items-baseline justify-between border-t-2 border-zinc-800 pt-3">
                  <dt className="text-[12px] font-black tracking-[0.22em] text-orange-500">⬢ TỔNG</dt>
                  <dd className="text-[20px] font-black text-orange-400">
                    {formatVnd(order.totalAmount)}
                  </dd>
                </div>
              </dl>
            </div>

            {order.status === "delivered" && reviewableProducts.length > 0 && (
              <OrderReviewSection orderId={order.id} products={reviewableProducts} />
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-zinc-800 pt-5">
              <Link
                href="/orders"
                className="mc-btn-outline mc-btn-outline-lg flex-1 justify-center"
              >
                ◀ ĐƠN HÀNG
              </Link>
              <Link
                href="/products"
                className="mc-btn-primary mc-btn-primary-lg flex-1 justify-center"
              >
                ⬢ TIẾP TỤC MUA
              </Link>
              {order.status === "pending" && (
                <CancelOrderButton orderId={order.id} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
