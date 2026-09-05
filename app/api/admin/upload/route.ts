import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/** Serverless hosts have a read-only filesystem, so photos go in the database. */
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * POST /api/admin/upload — multipart form with a single `file` field.
 * Responds with the URL to store on the product.
 */
export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Image must be a JPEG, PNG, WebP or AVIF file." },
        { status: 415 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is larger than 4MB. Please compress it and try again." },
        { status: 413 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const stored = await prisma.productImage.create({
      data: { data: bytes, mimeType: file.type, fileName: file.name },
      select: { id: true },
    });

    return NextResponse.json({ url: `/api/images/${stored.id}` }, { status: 201 });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json({ error: "Could not upload that image." }, { status: 500 });
  }
}
