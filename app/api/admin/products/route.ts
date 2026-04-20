import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { isAdminRequest } from "@/lib/admin";
import {
  createProduct,
  generateUniqueProductSlug,
  listProducts,
  skuExists,
} from "@/lib/products";
import { parseProductForm } from "./form";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const products = await listProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let parsed;
  try {
    parsed = await parseProductForm(await req.formData());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let slug: string;
  try {
    slug = await generateUniqueProductSlug(parsed.name);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Slug không hợp lệ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  for (const v of parsed.variants) {
    if (await skuExists(v.sku)) {
      return NextResponse.json(
        { error: `Mã sản phẩm "${v.sku}" đã tồn tại` },
        { status: 409 }
      );
    }
  }

  const product = await createProduct(
    {
      name: parsed.name,
      slug,
      imageUrl: parsed.imageUrl,
      categoryIds: parsed.categoryIds,
    },
    parsed.variants.map((v) => ({
      sku: v.sku,
      imageUrl: v.imageUrl,
      listPrice: v.listPrice,
      salePrice: v.salePrice,
    }))
  );
  return NextResponse.json({ product }, { status: 201 });
}
