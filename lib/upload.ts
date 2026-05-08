import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

/** Upload directory — outside of public/ so we serve via API route */
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export type UploadResult = { url: string };
export type UploadOptions = { maxSize?: number };

export function getUploadDir() {
  return UPLOAD_DIR;
}

export function getMimeForExt(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase()] ?? "application/octet-stream";
}

export async function saveImageUpload(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
  const ext = EXT_BY_MIME[file.type];
  if (!ext) throw new UploadError("Định dạng ảnh không được hỗ trợ");
  if (file.size === 0) throw new UploadError("File rỗng");
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    throw new UploadError(`Ảnh vượt quá ${mb}MB`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buf);

  // Serve via API route — works in production without rebuild
  return { url: `/api/uploads/${name}` };
}

export class UploadError extends Error {}
