import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";
import { isAdminRequest } from "@/lib/admin";
import {
  collectDescendantIds,
  deleteCategory,
  depthOf,
  listCategories,
  MAX_DEPTH,
  slugExists,
  slugify,
  subtreeHeight,
  updateCategory,
  type Category,
} from "@/lib/categories";
import { saveImageUpload, UploadError } from "@/lib/upload";

async function getById(id: string): Promise<Category | null> {
  const { rows } = await pool.query(
    `SELECT id, name, slug, image_url AS "imageUrl", sort_order AS "sortOrder",
            parent_id AS "parentId", is_featured AS "isFeatured"
     FROM categories WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAdminRequest(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }

  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const rawSlug = String(form.get("slug") ?? "").trim();
  const rawParentId = String(form.get("parentId") ?? "").trim();
  const isFeatured = form.get("isFeatured") === "1";
  const image = form.get("image");
  const removeImage = form.get("removeImage") === "1";

  if (!name) {
    return NextResponse.json({ error: "Tên danh mục là bắt buộc" }, { status: 400 });
  }

  const slug = slugify(rawSlug || name);
  if (!slug) {
    return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
  }
  if (await slugExists(slug, id)) {
    return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
  }

  let parentId: string | null = null;
  if (rawParentId) {
    if (rawParentId === id) {
      return NextResponse.json({ error: "Danh mục không thể là cha của chính nó" }, { status: 400 });
    }
    const all = await listCategories();
    const exists = all.some((c) => c.id === rawParentId);
    if (!exists) {
      return NextResponse.json({ error: "Danh mục cha không tồn tại" }, { status: 400 });
    }
    if (collectDescendantIds(all, id).has(rawParentId)) {
      return NextResponse.json({ error: "Không thể chọn danh mục con làm cha" }, { status: 400 });
    }
    if (depthOf(all, rawParentId) + 1 + subtreeHeight(all, id) > MAX_DEPTH) {
      return NextResponse.json(
        { error: `Chỉ hỗ trợ tối đa ${MAX_DEPTH + 1} cấp danh mục` },
        { status: 400 }
      );
    }
    parentId = rawParentId;
  }

  let imageUrl: string | null = existing.imageUrl;
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
  } else if (removeImage) {
    imageUrl = null;
  }

  const category = await updateCategory(id, { name, slug, imageUrl, parentId, isFeatured });
  if (!category) {
    return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }
  return NextResponse.json({ category });
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
  const ok = await deleteCategory(id);
  if (!ok) {
    return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
