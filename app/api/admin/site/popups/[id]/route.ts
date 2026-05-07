import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { deletePopup, updatePopup } from "@/lib/site";
import { saveImageUpload, UploadError } from "@/lib/upload";

const POPUP_MAX_SIZE = 10 * 1024 * 1024;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  try {
    const { id } = await params;
    const ct = req.headers.get("content-type") ?? "";

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const patch: Parameters<typeof updatePopup>[1] = {};
      const image = form.get("image");
      if (image instanceof File && image.size > 0) {
        const uploaded = await saveImageUpload(image, { maxSize: POPUP_MAX_SIZE });
        patch.imageUrl = uploaded.url;
      }
      if (form.has("linkUrl")) {
        const v = (form.get("linkUrl") as string | null)?.trim() || null;
        patch.linkUrl = v;
      }
      if (form.has("title")) {
        const v = (form.get("title") as string | null)?.trim() || null;
        patch.title = v;
      }
      if (form.has("isActive")) {
        patch.isActive = form.get("isActive") === "1";
      }
      const popup = await updatePopup(id, patch);
      if (!popup) return NextResponse.json({ error: "Không tìm thấy popup" }, { status: 404 });
      return NextResponse.json({ popup });
    }

    const body = await req.json().catch(() => ({}));
    const patch: Parameters<typeof updatePopup>[1] = {};
    if (typeof body?.linkUrl !== "undefined") {
      patch.linkUrl = body.linkUrl ? String(body.linkUrl).trim() || null : null;
    }
    if (typeof body?.title !== "undefined") {
      patch.title = body.title ? String(body.title).trim() || null : null;
    }
    if (typeof body?.isActive === "boolean") {
      patch.isActive = body.isActive;
    }
    const popup = await updatePopup(id, patch);
    if (!popup) return NextResponse.json({ error: "Không tìm thấy popup" }, { status: 404 });
    return NextResponse.json({ popup });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  await deletePopup(id);
  return NextResponse.json({ ok: true });
}
