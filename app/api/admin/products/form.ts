import { saveImageUpload, UploadError } from "@/lib/upload";
import { normalizeSku } from "@/lib/products";

export type ParsedVariant = {
  id: string | null;
  sku: string;
  imageUrl: string | null;
  listPrice: number;
  salePrice: number;
  stock: number;
};

export type ParsedProductForm = {
  name: string;
  description: string;
  categoryIds: string[];
  imageUrl: string | null;
  isPreorder: boolean;
  variants: ParsedVariant[];
};

type VariantDescriptor = {
  id?: string | null;
  sku?: string;
  listPrice?: number;
  salePrice?: number;
  stock?: number;
  imageOp?: "keep" | "remove" | "upload";
  existingImageUrl?: string | null;
};

async function saveOrThrow(file: File): Promise<string> {
  try {
    const res = await saveImageUpload(file);
    return res.url;
  } catch (e) {
    if (e instanceof UploadError) throw new Error(e.message);
    throw e;
  }
}

export async function parseProductForm(
  form: FormData,
  existing?: {
    imageUrl: string | null;
    variantsById: Map<string, { imageUrl: string | null }>;
  }
): Promise<ParsedProductForm> {
  const name = String(form.get("name") ?? "").trim();
  if (!name) throw new Error("Tên sản phẩm là bắt buộc");

  const description = String(form.get("description") ?? "").trim();

  const rawCategories = form.getAll("categoryIds");
  const categoryIds = Array.from(
    new Set(
      rawCategories
        .map((v) => String(v).trim())
        .filter((s) => s.length > 0)
    )
  );

  const image = form.get("image");
  const removeMainImage = form.get("removeImage") === "1";

  let imageUrl: string | null = existing?.imageUrl ?? null;
  if (image instanceof File && image.size > 0) {
    imageUrl = await saveOrThrow(image);
  } else if (removeMainImage) {
    imageUrl = null;
  }

  const variantsJson = String(form.get("variants") ?? "[]");
  let descriptors: VariantDescriptor[];
  try {
    descriptors = JSON.parse(variantsJson);
  } catch {
    throw new Error("Danh sách biến thể không hợp lệ");
  }
  if (!Array.isArray(descriptors) || descriptors.length === 0) {
    throw new Error("Sản phẩm phải có ít nhất một mã");
  }

  const seenSku = new Set<string>();
  const variants: ParsedVariant[] = [];
  for (let i = 0; i < descriptors.length; i++) {
    const d = descriptors[i];
    const sku = normalizeSku(String(d.sku ?? ""));
    if (!sku) throw new Error(`Mã sản phẩm #${i + 1} là bắt buộc`);
    if (seenSku.has(sku))
      throw new Error(`Mã sản phẩm "${sku}" bị trùng trong danh sách`);
    seenSku.add(sku);

    const listPrice = Number(d.listPrice);
    const salePrice = Number(d.salePrice);
    const stock = Number(d.stock ?? 0);
    if (!Number.isFinite(listPrice) || listPrice < 0)
      throw new Error(`Giá niêm yết của "${sku}" không hợp lệ`);
    if (!Number.isFinite(salePrice) || salePrice < 0)
      throw new Error(`Giá bán của "${sku}" không hợp lệ`);
    if (!Number.isFinite(stock) || stock < 0)
      throw new Error(`Tồn kho của "${sku}" không hợp lệ`);

    const id = d.id ? String(d.id) : null;
    const existingVariant = id ? existing?.variantsById.get(id) : undefined;
    let variantImageUrl: string | null = existingVariant?.imageUrl ?? null;

    const op = d.imageOp;
    if (op === "upload") {
      const f = form.get(`variantImage_${i}`);
      if (!(f instanceof File) || f.size === 0) {
        throw new Error(`Thiếu ảnh cho mã "${sku}"`);
      }
      variantImageUrl = await saveOrThrow(f);
    } else if (op === "remove") {
      variantImageUrl = null;
    }

    variants.push({
      id,
      sku,
      imageUrl: variantImageUrl,
      listPrice: Math.round(listPrice),
      salePrice: Math.round(salePrice),
      stock: Math.round(stock),
    });
  }

  const isPreorder = form.get("isPreorder") === "1";

  return {
    name,
    description,
    categoryIds,
    imageUrl,
    isPreorder,
    variants,
  };
}
