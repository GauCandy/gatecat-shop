export type MockProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tag: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  spec: string;
  imageHue: string;
};

export type MockCategory = {
  id: string;
  slug: string;
  name: string;
  count: number;
  hue: string;
  glyph: string;
};

export const mockProducts: MockProduct[] = [
  {
    id: "p1",
    slug: "rog-strix-rtx-4090-oc",
    name: "ROG Strix RTX 4090 OC Edition",
    category: "VGA",
    tag: "Flagship",
    price: 49990000,
    oldPrice: 56990000,
    badge: "−12%",
    spec: "24GB GDDR6X · 2640 MHz · TriFan",
    imageHue: "from-fuchsia-500 to-violet-700",
  },
  {
    id: "p2",
    slug: "razer-blackwidow-v4-pro",
    name: "Razer BlackWidow V4 Pro",
    category: "Bàn phím",
    tag: "Mới",
    price: 6290000,
    oldPrice: 7490000,
    badge: "HOT",
    spec: "Green Switch · Doubleshot · RGB Chroma",
    imageHue: "from-emerald-400 to-teal-700",
  },
  {
    id: "p3",
    slug: "logitech-g-pro-x-superlight-2",
    name: "Logitech G Pro X Superlight 2",
    category: "Chuột",
    tag: "Esports",
    price: 4190000,
    spec: "60g · Hero 2 · 8000Hz Lightspeed",
    imageHue: "from-cyan-400 to-blue-700",
  },
  {
    id: "p4",
    slug: "samsung-odyssey-oled-g8",
    name: "Samsung Odyssey OLED G8",
    category: "Màn hình",
    tag: "OLED 240Hz",
    price: 28990000,
    oldPrice: 33990000,
    badge: "−15%",
    spec: '34" · 3440×1440 · 0.03ms · QD-OLED',
    imageHue: "from-orange-400 to-rose-700",
  },
  {
    id: "p5",
    slug: "msi-titan-18-hx-a14v",
    name: "MSI Titan 18 HX A14V",
    category: "Laptop",
    tag: "Mobile Beast",
    price: 119900000,
    spec: "i9-14900HX · RTX 4090 · 64GB DDR5",
    imageHue: "from-amber-400 to-red-700",
  },
  {
    id: "p6",
    slug: "secretlab-titan-evo-gaming-chair",
    name: "Secretlab Titan Evo 2024",
    category: "Ghế gaming",
    tag: "Pro Series",
    price: 13990000,
    oldPrice: 15990000,
    badge: "−12%",
    spec: "NEO Hybrid Leatherette · 4D Arm",
    imageHue: "from-slate-500 to-zinc-800",
  },
  {
    id: "p7",
    slug: "hyperx-cloud-iii-wireless",
    name: "HyperX Cloud III Wireless",
    category: "Tai nghe",
    tag: "Wireless",
    price: 3990000,
    spec: "DTS · 120h Battery · 53mm Driver",
    imageHue: "from-indigo-400 to-purple-700",
  },
  {
    id: "p8",
    slug: "corsair-virtuoso-max-wireless",
    name: "Corsair Virtuoso MAX Wireless",
    category: "Tai nghe",
    tag: "Premium",
    price: 8490000,
    oldPrice: 9990000,
    badge: "Mới",
    spec: "Dolby Atmos · Hi-Res · BT 5.3",
    imageHue: "from-rose-400 to-fuchsia-700",
  },
];

export const mockCategories: MockCategory[] = [
  { id: "c1", slug: "laptop", name: "Laptop Gaming", count: 124, hue: "from-fuchsia-500 to-violet-800", glyph: "▲" },
  { id: "c2", slug: "vga", name: "Card đồ họa", count: 87, hue: "from-cyan-400 to-blue-800", glyph: "◆" },
  { id: "c3", slug: "monitor", name: "Màn hình", count: 96, hue: "from-emerald-400 to-teal-800", glyph: "■" },
  { id: "c4", slug: "keyboard", name: "Bàn phím", count: 152, hue: "from-orange-400 to-red-800", glyph: "●" },
  { id: "c5", slug: "mouse", name: "Chuột", count: 138, hue: "from-amber-300 to-pink-700", glyph: "◇" },
  { id: "c6", slug: "headset", name: "Tai nghe", count: 71, hue: "from-indigo-400 to-purple-800", glyph: "◯" },
];

export const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export const marqueeItems = [
  "Giao hỏa tốc 2 giờ",
  "Trả góp 0% qua thẻ tín dụng",
  "Bảo hành chính hãng 24 tháng",
  "Free build PC khi mua bộ",
  "Đổi trả miễn phí 7 ngày",
  "Tặng bàn di chuột mọi đơn",
];
