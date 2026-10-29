import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readContent, writeContent } from "@/lib/content/store";
import { saveImage, readImage, sniffImage } from "@/lib/content/uploads";
import { seedContent } from "@/lib/content/seed";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "portfolio-"));
  vi.stubEnv("DATA_DIR", dir);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(dir, { recursive: true, force: true });
});

describe("content store", () => {
  it("serves the seed until the first save", async () => {
    expect(await readContent()).toEqual(seedContent);
  });

  it("saves, reads back and keeps the previous version in history", async () => {
    const first = { ...seedContent, skills: ["One"] };
    const second = { ...seedContent, skills: ["Two"] };
    await writeContent(first);
    await writeContent(second);
    expect((await readContent()).skills).toEqual(["Two"]);

    const history = await readdir(path.join(dir, "history"));
    expect(history).toHaveLength(1);
    const kept = JSON.parse(await readFile(path.join(dir, "history", history[0]!), "utf8"));
    expect(kept.skills).toEqual(["One"]);
  });

  it("refuses to read a file that no longer matches the schema", async () => {
    await writeFile(path.join(dir, "content.json"), JSON.stringify({ profile: {} }));
    await expect(readContent()).rejects.toThrow();
  });
});

describe("image uploads", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);

  it("recognises images by their bytes, not their name", () => {
    expect(sniffImage(png)).toBe("png");
    expect(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe("jpg");
    expect(sniffImage(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("webp");
    expect(sniffImage(new TextEncoder().encode("\0\0\0\x1cftypavif\0\0"))).toBe("avif");
    expect(sniffImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeNull();
  });

  it("stores an image under a random name and serves it back", async () => {
    const url = await saveImage(png);
    expect(url).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
    const image = await readImage(url.slice("/uploads/".length));
    expect(image?.contentType).toBe("image/png");
    expect(new Uint8Array(image!.bytes)).toEqual(png);
  });

  it("never reads outside the uploads folder", async () => {
    await writeFile(path.join(dir, "content.json"), "{}");
    expect(await readImage("../content.json")).toBeNull();
    expect(await readImage("missing.png")).toBeNull();
  });
});
