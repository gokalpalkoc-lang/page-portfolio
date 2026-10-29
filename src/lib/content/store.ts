import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { contentSchema, type Content } from "./schema";
import { seedContent } from "./seed";

// Content is one JSON file in DATA_DIR (a Docker volume in production). Every
// save first copies the previous version into history/, keeping the newest
// HISTORY_LIMIT files, so a bad edit can be rolled back by hand.

const HISTORY_LIMIT = 30;

export function dataDir(): string {
  return process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
}

export const uploadsDir = () => path.join(dataDir(), "uploads");
const contentFile = () => path.join(dataDir(), "content.json");
const historyDir = () => path.join(dataDir(), "history");

export async function readContent(): Promise<Content> {
  let raw: string;
  try {
    raw = await readFile(contentFile(), "utf8");
  } catch (error) {
    if (isNotFound(error)) return seedContent;
    throw error;
  }
  // A file that no longer matches the schema is an error to fix, not a reason to
  // fall back to the seed: the next save from /admin would overwrite real content.
  return contentSchema.parse(JSON.parse(raw));
}

export async function writeContent(content: Content): Promise<void> {
  const file = contentFile();
  await mkdir(historyDir(), { recursive: true });

  try {
    const previous = await readFile(file, "utf8");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await writeFile(path.join(historyDir(), `content-${stamp}.json`), previous);
    await pruneHistory();
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  // Write then rename, so a crash mid-write never leaves a half-written file.
  const temp = `${file}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(content, null, 2));
  await rename(temp, file);
}

async function pruneHistory(): Promise<void> {
  const files = (await readdir(historyDir())).filter((f) => f.startsWith("content-")).sort();
  const stale = files.slice(0, Math.max(0, files.length - HISTORY_LIMIT));
  await Promise.all(stale.map((f) => unlink(path.join(historyDir(), f))));
}

function isNotFound(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === "ENOENT";
}
