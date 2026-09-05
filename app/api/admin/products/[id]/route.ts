import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { parseProduct } from "@/lib/product-validation";

const FORBIDDEN = NextResponse.json(
  { error: "Admin access required." },
  { status: 403 },
);

function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

/** PATCH /api/admin/products/:id — partial update of one product. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminUser())) return FORBIDDEN;

  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseProduct(body, { partial: true });
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (parsed.data.name) {
      const clash = await prisma.product.findUnique({
        where: { name: parsed.data.name },
        select: { id: true },
      });
      if (clash && clash.id !== id) {
        return NextResponse.json(
          { error: "Another product already uses that name." },
          { status: 409 },
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    refreshPublicPages();
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Failed to update product", error);
    return NextResponse.json({ error: "Could not update the product." }, { status: 500 });
  }
}

/** DELETE /api/admin/products/:id */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminUser())) return FORBIDDEN;

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    refreshPublicPages();
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Failed to delete product", error);
    return NextResponse.json({ error: "Could not delete the product." }, { status: 500 });
  }
}
