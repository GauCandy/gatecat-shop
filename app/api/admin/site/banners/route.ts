import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createBanner, listBanners } from "@/lib/site";
import { saveImageUpload, UploadError } from "@/lib/upload";

const BANNER_MAX_SIZE = 15 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 20;

export async function GET() {
  await requireAdmin();
  const banners = await listBanners(false);
  return NextResponse.json({ banners });
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
        { error: "Vui lòng chọn ít nhất một ảnh banner" },
        { status: 400 }
      );
    }
    if (fileEntries.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Tối đa ${MAX_FILES_PER_REQUEST} ảnh mỗi lần` },
        { status: 400 }
      );
    }

    const isActive = form.get("isActive") !== "0";
    const linkUrl = (form.get("linkUrl") as string | null)?.trim() || null;
    const title = (form.get("title") as string | null)?.trim() || null;

    const banners = [];
    for (const file of fileEntries) {
      const uploaded = await saveImageUpload(file, { maxSize: BANNER_MAX_SIZE });
      const banner = await createBanner({
        imageUrl: uploaded.url,
        linkUrl,
        title,
        isActive,
      });
      banners.push(banner);
    }
    return NextResponse.json({ banners }, { status: 201 });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
