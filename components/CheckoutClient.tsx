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

const PANEL = "relative border-2 border-zinc-700 bg-zinc-900 p-6";

function PanelRivets() {
  return (
    <>
      <span className="mc-rivet mc-rivet-tl" />
      <span className="mc-rivet mc-rivet-tr" />
      <span className="mc-rivet mc-rivet-bl" />
      <span className="mc-rivet mc-rivet-br" />
    </>
  );
}

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
        <div className={PANEL}>
          <PanelRivets />
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ 01 · DELIVERY METHOD
          </p>
          <h2 className="mt-2 text-[18px] font-black uppercase tracking-tight text-zinc-100">
            Phương thức nhận hàng<span className="text-orange-500">.</span>
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label
              className={`mc-mono flex cursor-pointer items-start gap-3 border-2 p-3 transition ${
                deliveryMethod === "delivery"
                  ? "border-orange-500 bg-orange-500/8"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={() => setDeliveryMethod("delivery")}
                className="mt-1 h-4 w-4 accent-orange-500"
              />
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-zinc-100">
                  ⬢ GIAO TẬN NƠI
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  ▸ Shipper giao đến địa chỉ, miễn phí ship.
                </p>
              </div>
            </label>
            <label
              className={`mc-mono flex cursor-pointer items-start gap-3 border-2 p-3 transition ${
                deliveryMethod === "pickup"
                  ? "border-orange-500 bg-orange-500/8"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                className="mt-1 h-4 w-4 accent-orange-500"
              />
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-zinc-100">
                  ⬢ LẤY TẠI SHOP
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  ▸ Đến shop nhận trực tiếp. Không cần địa chỉ.
                </p>
              </div>
            </label>
          </div>
        </div>

        {deliveryMethod === "delivery" ? (
          <div className={PANEL}>
            <PanelRivets />
            <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
              ⬢ 02 · DEPLOY POINT
            </p>
            <h2 className="mt-2 text-[18px] font-black uppercase tracking-tight text-zinc-100">
              Địa chỉ giao hàng<span className="text-orange-500">.</span>
            </h2>
            {addresses.length === 0 ? (
              <div className="mt-4 border-2 border-dashed border-zinc-700 bg-zinc-950 p-4 text-center">
                <p className="mc-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  ⚠ Bạn chưa có địa chỉ nào.
                </p>
                <a
                  href="/account/addresses"
                  className="mc-mono mt-3 inline-flex text-[11px] font-black uppercase tracking-[0.22em] text-orange-400 hover:text-orange-300"
                >
                  ▸ THÊM ĐỊA CHỈ →
                </a>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 border-2 p-3 transition ${
                      selectedAddressId === addr.id
                        ? "border-orange-500 bg-orange-500/8"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
                          {addr.recipientName}
                        </span>
                        <span className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          {addr.phone}
                        </span>
                        {addr.isDefault && (
                          <span className="mc-tag-warning">⬢ MẶC ĐỊNH</span>
                        )}
                      </div>
                      <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.08em] text-zinc-300">
                        ▸ {addr.addressLine}
                      </p>
                      <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={PANEL}>
            <PanelRivets />
            <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
              ⬢ 02 · PICKUP DEPOT
            </p>
            <h2 className="mt-2 text-[18px] font-black uppercase tracking-tight text-zinc-100">
              Địa điểm lấy hàng<span className="text-orange-500">.</span>
            </h2>
            <div className="mt-4 border-2 border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[14px] font-black uppercase tracking-tight text-zinc-100">
                {SHOP_INFO.name}
              </p>
              <p className="mc-mono mt-2 text-[11px] uppercase tracking-[0.08em] text-zinc-300">
                ▸ {shopFullAddress()}
              </p>
              <div className="mc-mono mt-3 grid grid-cols-2 gap-2 border-t-2 border-zinc-800 pt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                <p>HOTLINE: <span className="text-orange-400">{SHOP_INFO.phone}</span></p>
                <p>OPEN: <span className="text-orange-400">{SHOP_INFO.hours}</span></p>
              </div>
              <p className="mc-mono mt-3 border-t-2 border-zinc-800 pt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                ▸ Shop sẽ chuẩn bị đơn và báo lại khi sẵn sàng. Mang CCCD khớp tên tài khoản.
              </p>
            </div>
          </div>
        )}

        <div className={PANEL}>
          <PanelRivets />
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ 03 · DISCOUNT TOKEN
          </p>
          <h2 className="mt-2 text-[18px] font-black uppercase tracking-tight text-zinc-100">
            Voucher<span className="text-orange-500">.</span>
          </h2>

          {applied ? (
            <div className="mc-mono mt-4 flex items-center justify-between gap-3 border-2 border-orange-500 bg-orange-500/10 p-3">
              <div className="min-w-0">
                <p className="text-[12px] font-black uppercase tracking-[0.22em] text-orange-300">
                  ⬢ {applied.code}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-zinc-300">
                  ▸ {applied.name} · giảm {formatVnd(applied.discount)}
                </p>
              </div>
              <button
                type="button"
                onClick={removeVoucher}
                className="mc-btn-outline shrink-0"
              >
                ✕ BỎ
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="MÃ VOUCHER"
                  className="mc-mono h-10 flex-1 border-2 border-zinc-700 bg-zinc-950 px-3 text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => applyVoucher(voucherCode)}
                  disabled={voucherBusy || !voucherCode.trim()}
                  className="mc-btn-primary disabled:opacity-50"
                >
                  ⬢ ÁP DỤNG
                </button>
              </div>
              {voucherError && (
                <p className="mc-mono mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400">
                  ⬢ ERR · {voucherError}
                </p>
              )}
            </>
          )}

          {available.length > 0 && (
            <div className="mt-5 border-t-2 border-zinc-800 pt-4">
              <p className="mc-mono mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-zinc-400">
                ▸ VOUCHER ĐANG CÓ
              </p>
              <div className="space-y-2">
                {available.map((v) => {
                  const isApplied = applied?.code === v.code;
                  const eligible = v.minOrderTotal == null || subtotal >= v.minOrderTotal;
                  return (
                    <div
                      key={v.id}
                      className={`flex items-start justify-between gap-3 border-2 p-3 ${
                        isApplied
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-zinc-800 bg-zinc-950"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="mc-mono text-[12px] font-black uppercase tracking-[0.22em] text-orange-400">
                            ⬢ {v.code}
                          </span>
                          <span className="mc-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                            {v.discountType === "percent"
                              ? `-${v.discountValue}%`
                              : `-${formatVnd(v.discountValue)}`}
                          </span>
                        </div>
                        <p className="mc-mono mt-1 text-[11px] uppercase tracking-[0.08em] text-zinc-300">
                          {v.name}
                        </p>
                        {v.minOrderTotal != null && (
                          <p className="mc-mono mt-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                            ▸ Đơn từ {formatVnd(v.minOrderTotal)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={voucherBusy || isApplied || !eligible}
                        onClick={() => applyVoucher(v.code)}
                        className="mc-btn-outline shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isApplied ? "✓ ĐÃ DÙNG" : eligible ? "⬢ DÙNG" : "✕ CHƯA ĐỦ"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={PANEL}>
          <PanelRivets />
          <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
            ⬢ 04 · PAYMENT METHOD
          </p>
          <h2 className="mt-2 text-[18px] font-black uppercase tracking-tight text-zinc-100">
            Thanh toán<span className="text-orange-500">.</span>
          </h2>
          <label className="mc-mono mt-4 flex cursor-pointer items-center gap-3 border-2 border-orange-500 bg-orange-500/8 p-3">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked
              disabled
              className="h-4 w-4 accent-orange-500"
            />
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100">
              ⬢ COD · Thanh toán khi nhận hàng
            </span>
          </label>
        </div>
      </div>

      <aside className="relative h-fit border-2 border-orange-500/60 bg-zinc-900 p-6 lg:sticky lg:top-28">
        <span className="mc-rivet mc-rivet-tl mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-tr mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-bl mc-rivet-lg" />
        <span className="mc-rivet mc-rivet-br mc-rivet-lg" />

        <p className="mc-mono text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">
          ⬢ DISPATCH MANIFEST
        </p>
        <h2 className="mt-2 text-[16px] font-black uppercase tracking-tight text-zinc-100">
          Chi tiết đơn<span className="text-orange-500">.</span>
        </h2>

        <div className="mt-4 space-y-3 border-t-2 border-zinc-800 pt-4">
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
                  className="h-14 w-14 border-2 border-zinc-800 bg-zinc-950 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[12px] font-black uppercase leading-tight tracking-tight text-zinc-100">
                    {item.productName}
                  </p>
                  <p className="mc-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {item.sku}
                  </p>
                  <p className="mc-mono mt-1 text-[11px] font-bold text-zinc-300">
                    {formatVnd(item.salePrice)} × {item.quantity}
                  </p>
                </div>
                <div className="whitespace-nowrap text-right">
                  <p className="mc-mono text-[12px] font-black text-orange-400">
                    {formatVnd(lineTotal)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="my-4 h-[2px] bg-zinc-800" />

        <div className="mc-mono space-y-2 text-[11px] uppercase tracking-[0.15em]">
          <div className="flex justify-between">
            <span className="text-zinc-500">▸ Tạm tính</span>
            <span className="font-bold text-zinc-100">{formatVnd(subtotal)}</span>
          </div>
          {applied && (
            <div className="flex justify-between">
              <span className="text-zinc-500">▸ Voucher {applied.code}</span>
              <span className="font-bold text-green-400">−{formatVnd(applied.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-500">▸ {deliveryMethod === "pickup" ? "Nhận tại shop" : "Phí ship"}</span>
            <span className="font-bold text-green-400">
              {deliveryMethod === "pickup" ? "Free" : "Free"}
            </span>
          </div>
          <div className="flex items-baseline justify-between border-t-2 border-zinc-800 pt-3">
            <span className="text-[11px] font-black tracking-[0.22em] text-orange-500">⬢ TỔNG</span>
            <span className="text-[20px] font-black text-orange-400">
              {formatVnd(total)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mc-mono mt-4 border-2 border-red-500/60 bg-red-500/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-red-300">
            ⬢ ERR · {error}
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
          className="mc-btn-primary mc-btn-primary-lg mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          ⬢ {busy ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG →"}
        </button>
      </aside>
    </div>
  );
}
