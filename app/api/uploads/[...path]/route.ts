import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { getUploadDir, getMimeForExt } from "@/lib/upload";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filename = segments.join("/");

  // Sanitize: only allow simple filenames, no directory traversal
  if (filename.includes("..") || filename.includes("\\") || segments.length !== 1) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(getUploadDir(), filename);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const ext = path.extname(filename).slice(1);
    const contentType = getMimeForExt(ext);
    const data = await readFile(filePath);

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
