import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { isAdminRequest } from "@/lib/admin";
import {
  deleteProduct,
  generateUniqueProductSlug,
  getProductById,
  skuExists,
  updateProduct,
} from "@/lib/products";
import { parseProductForm } from "../form";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  }

  const variantsById = new Map(
    existing.variants.map((v) => [v.id, { imageUrl: v.imageUrl }])
  );

  let parsed;
  try {
    parsed = await parseProductForm(await req.formData(), {
      imageUrl: existing.imageUrl,
      variantsById,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let slug: string;
  try {
    slug = await generateUniqueProductSlug(parsed.name, id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Slug không hợp lệ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  for (const v of parsed.variants) {
    if (await skuExists(v.sku, v.id ?? undefined)) {
      return NextResponse.json(
        { error: `Mã sản phẩm "${v.sku}" đã tồn tại` },
        { status: 409 }
      );
    }
  }

  const product = await updateProduct(
    id,
    {
      name: parsed.name,
      slug,
      imageUrl: parsed.imageUrl,
      categoryIds: parsed.categoryIds,
    },
    parsed.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      imageUrl: v.imageUrl,
      listPrice: v.listPrice,
      salePrice: v.salePrice,
    }))
  );
  if (!product) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const ok = await deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
