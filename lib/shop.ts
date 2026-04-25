export const SHOP_INFO = {
  name: "Gatecat Shop",
  addressLine: "123 Đường Láng",
  ward: "Phường Láng Thượng",
  district: "Quận Đống Đa",
  province: "Hà Nội",
  phone: "024 3333 4444",
  hours: "8:00 - 22:00 hàng ngày",
};

export function shopFullAddress(): string {
  return `${SHOP_INFO.addressLine}, ${SHOP_INFO.ward}, ${SHOP_INFO.district}, ${SHOP_INFO.province}`;
}
