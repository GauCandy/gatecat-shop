import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export type UploadResult = { url: string };

export async function saveImageUpload(file: File): Promise<UploadResult> {
  const ext = EXT_BY_MIME[file.type];
  if (!ext) throw new UploadError("Định dạng ảnh không được hỗ trợ");
  if (file.size === 0) throw new UploadError("File rỗng");
  if (file.size > MAX_SIZE) throw new UploadError("Ảnh vượt quá 5MB");

  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buf);

  return { url: `/uploads/${name}` };
}

export class UploadError extends Error {}
