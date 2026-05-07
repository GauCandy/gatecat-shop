import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSiteSettings, setSiteSetting } from "@/lib/site";
import { saveImageUpload, UploadError } from "@/lib/upload";

export async function GET() {
  await requireAdmin();
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  try {
    const form = await req.formData();
    const siteName = form.get("siteName");
    const removeLogo = form.get("removeLogo") === "1";
    const logo = form.get("logo");

    if (typeof siteName === "string") {
      const trimmed = siteName.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Tên website không được để trống" }, { status: 400 });
      }
      await setSiteSetting("site_name", trimmed);
    }

    if (logo instanceof File && logo.size > 0) {
      const uploaded = await saveImageUpload(logo);
      await setSiteSetting("logo_url", uploaded.url);
    } else if (removeLogo) {
      await setSiteSetting("logo_url", null);
    }

    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
