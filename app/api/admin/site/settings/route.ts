import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
    const ct = req.headers.get("content-type") ?? "";

    // JSON body — for marquee updates
    if (ct.includes("application/json")) {
      const body = await req.json();

      if (body.marqueeItems !== undefined) {
        if (!Array.isArray(body.marqueeItems)) {
          return NextResponse.json({ error: "marqueeItems phải là mảng" }, { status: 400 });
        }
        const items = body.marqueeItems
          .filter((v: unknown) => typeof v === "string" && v.trim())
          .map((v: string) => v.trim());
        if (items.length === 0) {
          return NextResponse.json({ error: "Cần ít nhất 1 nội dung marquee" }, { status: 400 });
        }
        await setSiteSetting("marquee_items", JSON.stringify(items));
      }

      const settings = await getSiteSettings();
      revalidatePath("/", "layout");
      return NextResponse.json({ settings });
    }

    // FormData body — for siteName + logo + heroBg + showcase
    const form = await req.formData();
    const siteName = form.get("siteName");
    const removeLogo = form.get("removeLogo") === "1";
    const logo = form.get("logo");
    const heroBg = form.get("heroBg");
    const removeHeroBg = form.get("removeHeroBg") === "1";
    const showcaseLabel = form.get("heroShowcaseLabel");
    const showcaseText = form.get("heroShowcaseText");
    const showcaseImage = form.get("heroShowcaseImage");
    const removeShowcaseImage = form.get("removeShowcaseImage") === "1";

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

    if (heroBg instanceof File && heroBg.size > 0) {
      const uploaded = await saveImageUpload(heroBg, { maxSize: 15 * 1024 * 1024 });
      await setSiteSetting("hero_bg_url", uploaded.url);
    } else if (removeHeroBg) {
      await setSiteSetting("hero_bg_url", null);
    }

    // Showcase fields
    if (typeof showcaseLabel === "string") {
      await setSiteSetting("hero_showcase_label", showcaseLabel.trim() || "NOW SHOWING");
    }
    if (typeof showcaseText === "string") {
      await setSiteSetting("hero_showcase_text", showcaseText.trim() || "Bộ sưu tập đang được lắp ráp.");
    }
    if (showcaseImage instanceof File && showcaseImage.size > 0) {
      const uploaded = await saveImageUpload(showcaseImage, { maxSize: 10 * 1024 * 1024 });
      await setSiteSetting("hero_showcase_image_url", uploaded.url);
    } else if (removeShowcaseImage) {
      await setSiteSetting("hero_showcase_image_url", null);
    }

    const settings = await getSiteSettings();
    revalidatePath("/", "layout");
    return NextResponse.json({ settings });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
