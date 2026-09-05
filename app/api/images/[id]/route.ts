import { prisma } from "@/lib/prisma";

/**
 * GET /api/images/:id — serves an admin-uploaded product photo.
 * Public on purpose: these are shop images shown on the catalogue.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const image = await prisma.productImage.findUnique({ where: { id } });
    if (!image) return new Response("Not found", { status: 404 });

    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.mimeType,
        // Bytes never change for a given id, so cache hard.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image read failed", error);
    return new Response("Not found", { status: 404 });
  }
}
