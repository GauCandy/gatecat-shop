export type ShippingNavItem = {
  href: string;
  label: string;
  desc: string;
  glyph: string;
};

export const shippingNavItems: ShippingNavItem[] = [
  { href: "/shipping/all", label: "ALL ORDERS", desc: "Tất cả đơn", glyph: "01" },
  { href: "/shipping/pending", label: "PENDING", desc: "Xác nhận đơn", glyph: "02" },
  { href: "/shipping/preparing", label: "PREPARING", desc: "Đang chuẩn bị", glyph: "03" },
  { href: "/shipping/delivering", label: "IN TRANSIT", desc: "Đang giao", glyph: "04" },
];
