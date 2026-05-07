import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createPopup, listPopups } from "@/lib/site";
import { saveImageUpload, UploadError } from "@/lib/upload";

const POPUP_MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 20;

export async function GET() {
  await requireAdmin();
  const popups = await listPopups(false);
  return NextResponse.json({ popups });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  try {
    const form = await req.formData();
    const fileEntries = [
      ...form.getAll("images"),
      ...form.getAll("image"),
    ].filter((v): v is File => v instanceof File && v.size > 0);

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một ảnh popup" },
        { status: 400 }
      );
    }
    if (fileEntries.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Tối đa ${MAX_FILES_PER_REQUEST} ảnh mỗi lần` },
        { status: 400 }
      );
    }

    const linkUrl = (form.get("linkUrl") as string | null)?.trim() || null;
    const title = (form.get("title") as string | null)?.trim() || null;
    const isActive =
      fileEntries.length === 1 ? form.get("isActive") === "1" : false;

    const popups = [];
    for (const file of fileEntries) {
      const uploaded = await saveImageUpload(file, { maxSize: POPUP_MAX_SIZE });
      const popup = await createPopup({
        imageUrl: uploaded.url,
        linkUrl,
        title,
        isActive,
      });
      popups.push(popup);
    }
    return NextResponse.json({ popups }, { status: 201 });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
