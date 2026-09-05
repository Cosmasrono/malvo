/**
 * Server-only catalogue access.
 *
 * The shop must never show an empty page because of a database hiccup, so
 * every read falls back to the starter catalogue shipped in `lib/products.ts`.
 */
import { prisma } from "@/lib/prisma";
import {
  starterProducts,
  type Category,
  type Product,
  type ProductIconKey,
  productIconKeys,
  assignableCategories,
  type AdminProduct,
} from "@/lib/products";

export type { AdminProduct };

type ProductRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  image: string | null;
  badge: string | null;
  published: boolean;
  sortOrder: number;
};

/** Narrows free-form database strings back onto the typed unions. */
function toProduct(row: ProductRow): AdminProduct {
  const category = assignableCategories.includes(row.category as Exclude<Category, "All">)
    ? (row.category as Exclude<Category, "All">)
    : "Workshop";
  const icon = productIconKeys.includes(row.icon as ProductIconKey)
    ? (row.icon as ProductIconKey)
    : "ToolIcon";

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category,
    icon,
    ...(row.image ? { image: row.image } : {}),
    ...(row.badge ? { badge: row.badge } : {}),
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

/** Published products for the public site. Falls back to the starter list. */
export async function getPublishedProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      orderBy: ORDER,
    });
    if (rows.length === 0) return starterProducts;
    return rows.map(toProduct);
  } catch (error) {
    console.error("Catalogue read failed, serving starter products", error);
    return starterProducts;
  }
}

/** Every product, published or not, for the admin screen. */
export async function getAllProducts(): Promise<AdminProduct[]> {
  const rows = await prisma.product.findMany({ orderBy: ORDER });
  return rows.map(toProduct);
}

/** True when nothing has been imported yet — drives the admin empty state. */
export async function catalogueIsEmpty(): Promise<boolean> {
  try {
    return (await prisma.product.count()) === 0;
  } catch {
    return true;
  }
}
