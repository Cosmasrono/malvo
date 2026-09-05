import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { getAllProducts } from "@/lib/catalog";
import { starterProducts } from "@/lib/products";
import { parseProduct } from "@/lib/product-validation";

const FORBIDDEN = NextResponse.json(
  { error: "Admin access required." },
  { status: 403 },
);

/** Clears the cached public pages after any catalogue change. */
function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

/** GET /api/admin/products — full catalogue, including unpublished items. */
export async function GET() {
  if (!(await getAdminUser())) return FORBIDDEN;
  try {
    return NextResponse.json({ products: await getAllProducts() });
  } catch (error) {
    console.error("Failed to list products", error);
    return NextResponse.json({ error: "Could not load the catalogue." }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 * `{ action: "import-starter" }` seeds the shipped catalogue; any other body
 * is treated as a new product.
 */
export async function POST(request: Request) {
  if (!(await getAdminUser())) return FORBIDDEN;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (body.action === "import-starter") {
      const existing = await prisma.product.findMany({ select: { name: true } });
      const taken = new Set(existing.map((row) => row.name));
      const missing = starterProducts.filter((product) => !taken.has(product.name));

      if (missing.length > 0) {
        await prisma.product.createMany({
          data: missing.map((product, index) => ({
            name: product.name,
            description: product.description,
            category: product.category,
            icon: product.icon,
            image: product.image ?? null,
            badge: product.badge ?? null,
            published: true,
            sortOrder: existing.length + index,
          })),
        });
        refreshPublicPages();
      }

      return NextResponse.json({ imported: missing.length, skipped: starterProducts.length - missing.length });
    }

    const parsed = parseProduct(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const duplicate = await prisma.product.findUnique({
      where: { name: parsed.data.name as string },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A product with that name already exists." },
        { status: 409 },
      );
    }

    const count = await prisma.product.count();
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name as string,
        description: parsed.data.description as string,
        category: parsed.data.category as string,
        icon: parsed.data.icon as string,
        image: parsed.data.image ?? null,
        badge: parsed.data.badge ?? null,
        price: parsed.data.price ?? null,
        published: parsed.data.published ?? true,
        sortOrder: parsed.data.sortOrder ?? count,
      },
    });

    refreshPublicPages();
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product", error);
    return NextResponse.json({ error: "Could not save the product." }, { status: 500 });
  }
}
