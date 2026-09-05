/**
 * Validation for admin-submitted products.
 *
 * Kept out of the route file so both the collection and the single-product
 * handlers can share exactly the same rules.
 */
import { productIconKeys, assignableCategories } from "@/lib/products";

export type ProductPayload = {
  name: string;
  description: string;
  category: string;
  icon: string;
  image: string | null;
  badge: string | null;
  price: number | null;
  published: boolean;
  sortOrder: number;
};

/**
 * Validates and normalises an admin-submitted product.
 * Returns either the clean payload or the first human-readable problem.
 */
export function parseProduct(
  body: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {},
): { data: Partial<ProductPayload> } | { error: string } {
  const data: Partial<ProductPayload> = {};

  const has = (key: string) => body[key] !== undefined;

  if (has("name") || !partial) {
    const name = String(body.name ?? "").trim();
    if (name.length < 3) return { error: "Product name must be at least 3 characters." };
    if (name.length > 120) return { error: "Product name is too long (max 120 characters)." };
    data.name = name;
  }

  if (has("description") || !partial) {
    const description = String(body.description ?? "").trim();
    if (description.length < 10) return { error: "Description must be at least 10 characters." };
    if (description.length > 1200) return { error: "Description is too long (max 1200 characters)." };
    data.description = description;
  }

  if (has("category") || !partial) {
    const category = String(body.category ?? "").trim();
    if (!assignableCategories.includes(category as never)) {
      return { error: `Category must be one of: ${assignableCategories.join(", ")}.` };
    }
    data.category = category;
  }

  if (has("icon") || !partial) {
    const icon = String(body.icon ?? "ToolIcon").trim();
    if (!productIconKeys.includes(icon as never)) {
      return { error: `Icon must be one of: ${productIconKeys.join(", ")}.` };
    }
    data.icon = icon;
  }

  if (has("image")) {
    const image = String(body.image ?? "").trim();
    if (!image) {
      data.image = null;
    } else if (/^(https:\/\/|\/)/.test(image)) {
      data.image = image;
    } else {
      return { error: "Image must be an https:// URL or a path starting with /." };
    }
  }

  if (has("badge")) {
    const badge = String(body.badge ?? "").trim();
    data.badge = badge ? badge.slice(0, 40) : null;
  }

  if (has("price")) {
    if (body.price === null || body.price === "") {
      data.price = null;
    } else {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return { error: "Price must be a number of shillings, or blank for \"ask us\"." };
      }
      if (price > 100_000_000) return { error: "That price looks too large." };
      data.price = Math.round(price);
    }
  }

  if (has("published")) data.published = Boolean(body.published);

  if (has("sortOrder")) {
    const sortOrder = Number(body.sortOrder);
    data.sortOrder = Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0;
  }

  return { data };
}
