import { ProductCard, type Product } from "./ProductCard";

const products: Product[] = [
  {
    id: "1",
    name: "ASUS ROG Strix G16 — Core i9 / RTX 4070",
    category: "LAPTOP",
    price: 49990000,
    oldPrice: 56990000,
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    badge: "Hot",
    specs: ["Intel Core i9-14900HX", "RTX 4070 8GB", "32GB DDR5 / 1TB SSD"],
    rating: 4.8,
    inStock: true,
  },
  {
    id: "2",
    name: "NVIDIA GeForce RTX 5090 Founders Edition",
    category: "GPU",
    price: 64990000,
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
    badge: "New",
    specs: ["24GB GDDR7", "21,760 CUDA Cores", "PCIe 5.0 / DP 2.1"],
    rating: 4.9,
    inStock: true,
  },
  {
    id: "3",
    name: "MacBook Pro 14 M4 Pro — Space Black",
    category: "LAPTOP",
    price: 54990000,
    oldPrice: 59990000,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    specs: ["Apple M4 Pro 12-core", "18GB Unified Memory", "1TB SSD / 14.2\" XDR"],
    rating: 4.9,
    inStock: true,
  },
  {
    id: "4",
    name: "Intel Core Ultra 9 285K — Arrow Lake",
    category: "CPU",
    price: 14990000,
    oldPrice: 16990000,
    image:
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80",
    badge: "Sale",
    specs: ["24 cores / 24 threads", "Boost up to 5.7GHz", "Socket LGA1851"],
    rating: 4.7,
    inStock: true,
  },
  {
    id: "5",
    name: "Samsung 990 Pro 2TB NVMe Gen4",
    category: "SSD",
    price: 4490000,
    oldPrice: 5290000,
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80",
    specs: ["7,450 MB/s read", "6,900 MB/s write", "M.2 2280 / 5yr warranty"],
    rating: 4.8,
    inStock: true,
  },
  {
    id: "6",
    name: "Logitech MX Master 3S — Graphite",
    category: "MOUSE",
    price: 2390000,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
    specs: ["8000 DPI Darkfield", "Quiet click switches", "USB-C / 70d battery"],
    rating: 4.9,
    inStock: true,
  },
  {
    id: "7",
    name: "Keychron Q1 Pro — Aluminium QMK/VIA",
    category: "KEYBOARD",
    price: 4290000,
    oldPrice: 4990000,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    badge: "Best",
    specs: ["75% layout / hot-swap", "Gateron Jupiter switches", "Wireless 2.4G + BT"],
    rating: 4.7,
    inStock: false,
  },
  {
    id: "8",
    name: 'LG UltraGear 27GR95QE — 27" 240Hz OLED',
    category: "MONITOR",
    price: 23990000,
    oldPrice: 27990000,
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    specs: ["2560×1440 / 240Hz", "0.03ms GtG / OLED", "G-Sync + FreeSync Premium"],
    rating: 4.8,
    inStock: true,
  },
  {
    id: "9",
    name: "AMD Ryzen 9 9950X — Zen 5 Flagship",
    category: "CPU",
    price: 17490000,
    image:
      "https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&q=80",
    badge: "New",
    specs: ["16 cores / 32 threads", "Boost up to 5.7GHz", "Socket AM5 / 170W"],
    rating: 4.8,
    inStock: true,
  },
  {
    id: "10",
    name: "Corsair Vengeance 64GB DDR5-6400 Kit",
    category: "RAM",
    price: 5890000,
    oldPrice: 6990000,
    image:
      "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80",
    specs: ["2×32GB DDR5-6400", "CL32 / 1.4V", "EXPO + XMP 3.0"],
    rating: 4.7,
    inStock: true,
  },
  {
    id: "11",
    name: "Razer BlackShark V2 Pro — Wireless",
    category: "HEADSET",
    price: 4990000,
    oldPrice: 5990000,
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
    badge: "Sale",
    specs: ["TriForce 50mm drivers", "THX Spatial Audio", "70h battery / BT 5.2"],
    rating: 4.6,
    inStock: true,
  },
  {
    id: "12",
    name: "NZXT H7 Flow RGB — Mid Tower Case",
    category: "CASE",
    price: 3590000,
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
    specs: ["Mesh front panel", "3×140mm RGB fans incl.", "ATX / USB-C front"],
    rating: 4.7,
    inStock: true,
  },
];

const categories = [
  { label: "All", count: 1248, active: true },
  { label: "Laptops", count: 312 },
  { label: "Desktops", count: 87 },
  { label: "GPUs", count: 64 },
  { label: "CPUs", count: 41 },
  { label: "Peripherals", count: 528 },
];

export function ProductGrid() {
  return (
    <section className="mx-auto w-full px-4 py-8 sm:px-6 lg:w-2/3 lg:px-0">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[12px] font-medium text-[var(--color-accent)]">
            Nổi bật
          </p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-tight text-[var(--color-text)] sm:text-[26px]">
            Sản phẩm được yêu thích
          </h2>
        </div>
        <a
          href="/products"
          className="hidden text-[13px] font-medium text-[var(--color-accent)] transition hover:underline sm:inline"
        >
          Xem tất cả →
        </a>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.label}
            type="button"
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
              c.active
                ? "bg-[var(--color-text)] text-white"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
            }`}
          >
            {c.label}
            <span className="ml-1.5 text-[11px] opacity-60">{c.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
