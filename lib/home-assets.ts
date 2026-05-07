import type { Category } from "./categories-types";
import type { Product, ProductCategoryRef } from "./products";

export const HOME_ASSETS = {
  heroFeatured: "/hero/featured.jpg",
  patternGridFade: "/patterns/grid-fade.jpg",
  patternDotMesh: "/patterns/dot-mesh.jpg",
  lifestyleGamer: "/lifestyle/setup-gamer.jpg",
  lifestyleCreator: "/lifestyle/setup-creator.jpg",
  lifestyleDev: "/lifestyle/setup-dev.jpg",
  brandGlyph: "/brand/glyph.png",
} as const;

const CATEGORY_ASSET_BY_SLUG: Record<string, string> = {
  laptop: "/cat/laptop-office.jpg",
  "laptop-gaming": "/cat/laptop-gaming.jpg",
  "laptop-van-phong": "/cat/laptop-office.jpg",
  "laptop-mong-nhe": "/cat/laptop-thin.jpg",
  "laptop-do-hoa": "/cat/laptop-office.jpg",
  macbook: "/cat/laptop-thin.jpg",

  pc: "/cat/pc-office.jpg",
  "pc-gaming": "/cat/pc-gaming.jpg",
  "pc-van-phong": "/cat/pc-office.jpg",
  "pc-do-hoa": "/cat/pc-gaming.jpg",
  "mini-pc": "/cat/pc-office.jpg",
  "pc-all-in-one": "/cat/monitor-24.jpg",

  "linh-kien-may-tinh": "/cat/components.jpg",
  cpu: "/cat/cpu.jpg",
  mainboard: "/cat/mainboard.jpg",
  ram: "/cat/ram.jpg",
  ssd: "/cat/storage.jpg",
  hdd: "/cat/storage.jpg",
  "o-cung": "/cat/storage.jpg",
  "o-cung-di-dong": "/cat/storage.jpg",
  "card-do-hoa": "/cat/components.jpg",
  "nguon-may-tinh": "/cat/components.jpg",
  "tan-nhiet": "/cat/components.jpg",
  "tan-nhiet-cpu": "/cat/components.jpg",
  "vo-case": "/cat/pc-gaming.jpg",
  "case-may-tinh": "/cat/pc-gaming.jpg",
  "quat-case": "/cat/components.jpg",

  "man-hinh": "/cat/monitor-24.jpg",
  "man-hinh-22-inch": "/cat/monitor-24.jpg",
  "man-hinh-24-inch": "/cat/monitor-24.jpg",
  "man-hinh-27-inch": "/cat/monitor-4k.jpg",
  "man-hinh-32-inch": "/cat/monitor-4k.jpg",
  "man-hinh-4k": "/cat/monitor-4k.jpg",
  "man-hinh-cong": "/cat/monitor-curved.jpg",
  "man-hinh-gaming": "/cat/monitor-curved.jpg",
  "man-hinh-do-hoa": "/cat/monitor-4k.jpg",
  "gia-do-man-hinh": "/cat/monitor-arm.jpg",

  "ban-phim": "/cat/keyboard.jpg",
  "ban-phim-co": "/cat/keyboard.jpg",
  "ban-phim-gaming": "/cat/keyboard.jpg",
  "ban-phim-khong-day": "/cat/keyboard.jpg",
  "ban-phim-van-phong": "/cat/keyboard.jpg",

  chuot: "/cat/mouse.jpg",
  "chuot-gaming": "/cat/mouse.jpg",
  "chuot-van-phong": "/cat/mouse.jpg",
  "chuot-khong-day": "/cat/mouse.jpg",
  "chuot-bluetooth": "/cat/mouse.jpg",

  "noi-that-gaming": "/cat/gaming-desk.jpg",
  "ban-gaming": "/cat/gaming-desk.jpg",
  "ghe-gaming": "/cat/gaming-chair.jpg",
};

type CategoryVisual = Pick<Category, "imageUrl" | "slug">;

export function getCategoryFallbackImageUrl(slug: string): string | null {
  return CATEGORY_ASSET_BY_SLUG[slug] ?? null;
}

export function getCategoryVisualUrl(category: CategoryVisual): string | null {
  return category.imageUrl ?? getCategoryFallbackImageUrl(category.slug);
}

export function getProductFallbackImageUrl(
  categories: ProductCategoryRef[]
): string {
  for (const category of categories) {
    const imageUrl = getCategoryFallbackImageUrl(category.slug);
    if (imageUrl) return imageUrl;
  }
  return HOME_ASSETS.heroFeatured;
}

export function getProductVisualUrl(
  product: Product,
  variantImageUrl?: string | null
): string {
  return (
    product.imageUrl ??
    variantImageUrl ??
    getProductFallbackImageUrl(product.categories)
  );
}
