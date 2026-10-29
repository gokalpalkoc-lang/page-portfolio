import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_PATH } from "./schema";
import { uploadsDir } from "./store";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const CONTENT_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
} as const;

type ImageExtension = keyof typeof CONTENT_TYPES;

/** Identifies an image by its first bytes; the browser-supplied type is not trusted. SVG is refused (it can carry scripts). */
export function sniffImage(bytes: Uint8Array): ImageExtension | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "avif";
  return null;
}

/** Saves an uploaded image and returns its public path, e.g. /uploads/1f…e2.webp. */
export async function saveImage(bytes: Uint8Array): Promise<string> {
  const ext = sniffImage(bytes);
  if (!ext) throw new Error("Unsupported image type");
  const name = `${randomUUID()}.${ext}`;
  await mkdir(uploadsDir(), { recursive: true });
  await writeFile(path.join(uploadsDir(), name), bytes);
  return `/uploads/${name}`;
}

export async function readImage(name: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!UPLOAD_PATH.test(`/uploads/${name}`)) return null;
  const ext = name.slice(name.lastIndexOf(".") + 1) as ImageExtension;
  try {
    return { bytes: await readFile(path.join(uploadsDir(), name)), contentType: CONTENT_TYPES[ext] };
  } catch {
    return null;
  }
}
