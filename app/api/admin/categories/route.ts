import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { isAdminRequest } from "@/lib/admin";
import { pool } from "@/lib/db";
import {
  createCategory,
  listCategories,
  slugExists,
  slugify,
} from "@/lib/categories";
import { saveImageUpload, UploadError } from "@/lib/upload";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const rawSlug = String(form.get("slug") ?? "").trim();
  const rawParentId = String(form.get("parentId") ?? "").trim();
  const image = form.get("image");

  if (!name) {
    return NextResponse.json({ error: "Tên danh mục là bắt buộc" }, { status: 400 });
  }

  const slug = slugify(rawSlug || name);
  if (!slug) {
    return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
  }
  if (await slugExists(slug)) {
    return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
  }

  let parentId: string | null = null;
  if (rawParentId) {
    const { rows } = await pool.query(
      "SELECT 1 FROM categories WHERE id = $1 LIMIT 1",
      [rawParentId]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Danh mục cha không tồn tại" }, { status: 400 });
    }
    parentId = rawParentId;
  }

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    try {
      const res = await saveImageUpload(image);
      imageUrl = res.url;
    } catch (e) {
      if (e instanceof UploadError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      throw e;
    }
  }

  const category = await createCategory({ name, slug, imageUrl, parentId });
  return NextResponse.json({ category }, { status: 201 });
}
