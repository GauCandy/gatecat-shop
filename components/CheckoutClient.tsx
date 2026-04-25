"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Address } from "@/lib/addresses";
import type { CartItem } from "@/lib/cart";
import type { Voucher } from "@/lib/vouchers";
import { SHOP_INFO, shopFullAddress } from "@/lib/shop";

type DeliveryMethod = "delivery" | "pickup";

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

type AppliedVoucher = { code: string; name: string; discount: number };

export function CheckoutClient({
  addresses,
  items,
}: {
  addresses: Address[];
  items: CartItem[];
}) {
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);

  const [available, setAvailable] = useState<Voucher[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [applied, setApplied] = useState<AppliedVoucher | null>(null);
  const [voucherBusy, setVoucherBusy] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vouchers/available")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data?.vouchers)) setAvailable(data.vouchers);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const applyVoucher = async (code: string) => {
    if (!code.trim()) return;
    setVoucherBusy(true);
    setVoucherError(null);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVoucherError(data?.error ?? "Voucher không hợp lệ");
        return;
      }
      setApplied({
        code: data.voucher.code,
        name: data.voucher.name,
        discount: data.discount,
      });
      setVoucherCode("");
    } catch {
      setVoucherError("Lỗi kết nối");
    } finally {
      setVoucherBusy(false);
    }
  };

  const removeVoucher = () => {
    setApplied(null);
    setVoucherError(null);
  };

  const total = Math.max(0, subtotal - (applied?.discount ?? 0));

  const handleCheckout = async () => {
    if (deliveryMethod === "delivery" && !selectedAddressId) {
      setError("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const cartItemIds = items.map((i) => i.id);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItemIds,
          addressId: deliveryMethod === "delivery" ? selectedAddressId : null,
          voucherCode: applied?.code ?? null,
          deliveryMethod,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Không đặt hàng được");
        return;
      }

      router.push(`/orders/${data.order.id}`);
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-6">
          <h2 className="text-[18px] font-bold text-[var(--color-text)]">
            Phương thức nhận hàng
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                deliveryMethod === "delivery"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={() => setDeliveryMethod("delivery")}
                className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
              />
              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  Giao hàng tận nơi
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-dim)]">
                  Shipper giao đến địa chỉ của bạn, miễn phí ship.
                </p>
              </div>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                deliveryMethod === "pickup"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
              />
              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  Lấy hàng tại shop
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-dim)]">
                  Đến shop nhận trực tiếp. Không cần địa chỉ.
                </p>
              </div>
            </label>
          </div>
        </div>

        {deliveryMethod === "delivery" ? (
          <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-6">
            <h2 className="text-[18px] font-bold text-[var(--color-text)]">
              Địa chỉ giao hàng
            </h2>
            {addresses.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-center">
                <p className="text-[13px] text-[var(--color-text-dim)]">
                  Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ.
                </p>
                <a
                  href="/account/addresses"
                  className="mt-2 inline-flex text-[13px] font-medium text-[var(--color-accent)] hover:underline"
                >
                  Thêm địa chỉ
                </a>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] p-3 transition hover:bg-[var(--color-surface-2)]"
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--color-text)]">
                          {addr.recipientName}
                        </span>
                        <span className="text-[12px] text-[var(--color-text-dim)]">
                          {addr.phone}
                        </span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-text)]">
                        {addr.addressLine}
                      </p>
                      <p className="text-[12px] text-[var(--color-text-dim)]">
                        {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-6">
            <h2 className="text-[18px] font-bold text-[var(--color-text)]">
              Địa điểm lấy hàng
            </h2>
            <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
              <p className="text-[14px] font-semibold text-[var(--color-text)]">
                {SHOP_INFO.name}
              </p>
              <p className="mt-1 text-[13px] text-[var(--color-text)]">
                {shopFullAddress()}
              </p>
              <p className="mt-2 text-[12px] text-[var(--color-text-dim)]">
                Hotline: <span className="text-[var(--color-text)]">{SHOP_INFO.phone}</span>
              </p>
              <p className="text-[12px] text-[var(--color-text-dim)]">
                Giờ mở cửa: <span className="text-[var(--color-text)]">{SHOP_INFO.hours}</span>
              </p>
              <p className="mt-3 text-[12px] text-[var(--color-text-dim)]">
                Shop sẽ chuẩn bị đơn và báo lại khi sẵn sàng. Vui lòng mang CCCD khớp với tên tài khoản khi đến lấy.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-6">
          <h2 className="text-[18px] font-bold text-[var(--color-text)]">Voucher</h2>

          {applied ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="min-w-0">
                <p className="font-mono text-[13px] font-semibold text-green-800">
                  {applied.code}
                </p>
                <p className="text-[12px] text-green-700">
                  {applied.name} · giảm {formatVnd(applied.discount)}
                </p>
              </div>
              <button
                type="button"
                onClick={removeVoucher}
                className="shrink-0 rounded-md border border-green-300 bg-white px-3 py-1 text-[12px] font-medium text-green-700 transition hover:bg-green-100"
              >
                Bỏ
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã voucher"
                  className="h-10 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 font-mono text-[13px] uppercase focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                <button
                  type="button"
                  onClick={() => applyVoucher(voucherCode)}
                  disabled={voucherBusy || !voucherCode.trim()}
                  className="rounded-lg bg-[var(--color-accent)] px-4 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  Áp dụng
                </button>
              </div>
              {voucherError && (
                <p className="mt-2 text-[12px] text-red-600">{voucherError}</p>
              )}
            </>
          )}

          {available.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[12px] font-medium text-[var(--color-text-dim)]">
                Voucher đang có
              </p>
              <div className="space-y-2">
                {available.map((v) => {
                  const isApplied = applied?.code === v.code;
                  const eligible = v.minOrderTotal == null || subtotal >= v.minOrderTotal;
                  return (
                    <div
                      key={v.id}
                      className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
                        isApplied
                          ? "border-green-300 bg-green-50"
                          : "border-[var(--color-border)] bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-semibold text-[var(--color-text)]">
                            {v.code}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-dim)]">
                            {v.discountType === "percent"
                              ? `-${v.discountValue}%`
                              : `-${formatVnd(v.discountValue)}`}
                          </span>
                        </div>
                        <p className="text-[12px] text-[var(--color-text)]">{v.name}</p>
                        {v.minOrderTotal != null && (
                          <p className="text-[11px] text-[var(--color-text-dim)]">
                            Đơn từ {formatVnd(v.minOrderTotal)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={voucherBusy || isApplied || !eligible}
                        onClick={() => applyVoucher(v.code)}
                        className="shrink-0 rounded-md border border-[var(--color-accent)] bg-white px-3 py-1 text-[12px] font-medium text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:border-[var(--color-border)] disabled:text-[var(--color-text-dim)]"
                      >
                        {isApplied ? "Đã dùng" : eligible ? "Dùng" : "Chưa đủ"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--color-border-strong)] bg-white p-6">
          <h2 className="text-[18px] font-bold text-[var(--color-text)]">
            Phương thức thanh toán
          </h2>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/5 p-3">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked
              disabled
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            <span className="font-medium text-[var(--color-text)]">
              COD - Thanh toán khi nhận hàng
            </span>
          </label>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-[var(--color-border-strong)] bg-white p-6 lg:sticky lg:top-28">
        <h2 className="text-[16px] font-bold text-[var(--color-text)]">
          Chi tiết đơn hàng
        </h2>

        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const img = item.variantImageUrl ?? item.productImageUrl;
            const lineTotal = item.salePrice * item.quantity;
            return (
              <div key={item.id} className="flex gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img || ""}
                  alt={item.productName}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[12px] font-medium text-[var(--color-text)]">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-dim)]">
                    {item.sku}
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">
                    {formatVnd(item.salePrice)} × {item.quantity}
                  </p>
                </div>
                <div className="whitespace-nowrap text-right">
                  <p className="text-[12px] font-semibold text-[var(--color-text)]">
                    {formatVnd(lineTotal)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="my-4 h-px bg-[var(--color-border)]" />

        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between text-[var(--color-text-dim)]">
            <span>Tạm tính</span>
            <span className="text-[var(--color-text)]">{formatVnd(subtotal)}</span>
          </div>
          {applied && (
            <div className="flex justify-between text-green-700">
              <span>Voucher {applied.code}</span>
              <span>-{formatVnd(applied.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[var(--color-text-dim)]">
            <span>{deliveryMethod === "pickup" ? "Nhận tại shop" : "Phí ship"}</span>
            <span className="text-green-600 font-medium">
              {deliveryMethod === "pickup" ? "Không phát sinh" : "Miễn phí"}
            </span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="font-semibold text-[var(--color-text)]">Tổng cộng</span>
            <span className="text-[16px] font-bold text-[var(--color-text)]">
              {formatVnd(total)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={
            busy ||
            (deliveryMethod === "delivery" &&
              (!selectedAddressId || addresses.length === 0))
          }
          onClick={handleCheckout}
          className="mt-5 w-full rounded-lg bg-[var(--color-accent)] px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </aside>
    </div>
  );
}
