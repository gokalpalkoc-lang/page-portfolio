import { readImage } from "@/lib/content/uploads";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const image = await readImage((await params).file);
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      // Every upload gets a fresh random name, so a URL's content never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
