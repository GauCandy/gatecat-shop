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
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đang chuẩn bị hàng", color: "bg-blue-100 text-blue-700" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  returned: { label: "Hoàn hàng", color: "bg-orange-100 text-orange-700" },
  cancelled: { label: "Đã huỷ", color: "bg-gray-200 text-gray-700" },
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
            title={`Đơn hàng #${order.id.slice(0, 8).toUpperCase()}`}
          />

          <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <p className="text-[13px] text-[var(--color-text-dim)]">
                {formatDate(order.createdAt)}
              </p>
              {status && (
                <span
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold ${status.color}`}
                >
                  {status.label}
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
                  {order.deliveryMethod === "pickup"
                    ? "Địa điểm lấy hàng"
                    : "Địa chỉ giao hàng"}
                </h2>
                <div className="mt-2 rounded-lg bg-[var(--color-surface-2)] p-3">
                  {order.deliveryMethod === "pickup" ? (
                    <>
                      <p className="font-semibold text-[var(--color-text)]">
                        {SHOP_INFO.name}
                      </p>
                      <p className="text-[12px] text-[var(--color-text-dim)]">
                        {SHOP_INFO.phone}
                      </p>
                      <p className="mt-1 text-[13px] text-[var(--color-text)]">
                        {shopFullAddress()}
                      </p>
                      <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
                        Giờ mở cửa: {SHOP_INFO.hours}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-[var(--color-text)]">
                        {order.recipientName}
                      </p>
                      <p className="text-[12px] text-[var(--color-text-dim)]">
                        {order.phone}
                      </p>
                      <p className="mt-1 text-[13px] text-[var(--color-text)]">
                        {order.addressLine}
                      </p>
                      <p className="text-[12px] text-[var(--color-text-dim)]">
                        {order.ward}, {order.district}, {order.province}
                      </p>
                      {order.note && (
                        <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
                          <span className="font-medium">Ghi chú:</span> {order.note}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
                  Phương thức nhận hàng & thanh toán
                </h2>
                <div className="mt-2 rounded-lg bg-[var(--color-surface-2)] p-3">
                  <p className="font-semibold text-[var(--color-text)]">
                    {order.deliveryMethod === "pickup"
                      ? "Lấy tại shop"
                      : "Giao hàng tận nơi"}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--color-text)]">
                    COD - Thanh toán khi nhận hàng
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--color-text-dim)]">
                    {order.deliveryMethod === "pickup"
                      ? "Thanh toán tại quầy khi đến lấy hàng."
                      : "Chuẩn bị tiền mặt khi nhân viên giao hàng đến."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--color-border)] pt-6">
              <h2 className="text-[14px] font-bold text-[var(--color-text)]">
                Chi tiết sản phẩm
              </h2>
              <div className="mt-4 space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-lg border border-[var(--color-border)] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-text)]">
                        {item.productName}
                      </p>
                      <p className="text-[12px] text-[var(--color-text-dim)]">
                        Mã: {item.variantSku}
                      </p>
                      <p className="mt-1 text-[12px] text-[var(--color-text)]">
                        {formatVnd(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right">
                      <p className="font-semibold text-[var(--color-text)]">
                        {formatVnd(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--color-border)] pt-6">
              <dl className="space-y-2 text-[13px]">
                <div className="flex justify-between text-[var(--color-text-dim)]">
                  <dt>Tạm tính</dt>
                  <dd className="text-[var(--color-text)]">
                    {formatVnd(order.totalAmount + order.discountAmount)}
                  </dd>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <dt>
                      Voucher
                      {order.voucherCode && (
                        <span className="ml-1 font-mono">{order.voucherCode}</span>
                      )}
                    </dt>
                    <dd>-{formatVnd(order.discountAmount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-[var(--color-text-dim)]">
                  <dt>Phí ship</dt>
                  <dd className="text-green-600 font-medium">Miễn phí</dd>
                </div>
                <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
                  <dt className="font-bold text-[var(--color-text)]">Tổng cộng</dt>
                  <dd className="text-[16px] font-bold text-[var(--color-text)]">
                    {formatVnd(order.totalAmount)}
                  </dd>
                </div>
              </dl>
            </div>

            {order.status === "delivered" && reviewableProducts.length > 0 && (
              <OrderReviewSection orderId={order.id} products={reviewableProducts} />
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-5 py-3 text-[13px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)]"
              >
                Quay lại đơn hàng
              </Link>
              <Link
                href="/products"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-[var(--color-accent)] px-5 py-3 text-[13px] font-semibold text-white transition hover:brightness-110"
              >
                Tiếp tục mua sắm
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
