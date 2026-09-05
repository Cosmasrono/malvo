"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { categories, type Category, type PublicProduct, type ProductIconKey } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatKsh } from "@/lib/money";
import { whatsappLink, site, primaryPhone } from "@/lib/site";
import {
  BladeIcon,
  GrainIcon,
  GaugeIcon,
  DropIcon,
  BoltIcon,
  SparkIcon,
  DiscIcon,
  PlugIcon,
  ToolIcon,
  CartIcon,
  WhatsAppIcon,
  SearchIcon,
  CloseIcon,
  CheckIcon,
  PhoneIcon,
} from "@/components/icons";

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
const productIconMap: Record<ProductIconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  BladeIcon,
  GrainIcon,
  GaugeIcon,
  DropIcon,
  BoltIcon,
  SparkIcon,
  DiscIcon,
  PlugIcon,
  ToolIcon,
};

type SortOption = "featured" | "price-asc" | "price-desc" | "name";

// ---------------------------------------------------------------------------
// Product Quick-View Modal
// ---------------------------------------------------------------------------
function ProductQuickViewModal({
  product,
  onClose,
}: {
  product: PublicProduct;
  onClose: () => void;
}) {
  const Icon = productIconMap[product.icon];
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const buyable = Boolean(product.id) && typeof product.price === "number" && product.price > 0;

  // Close on Escape key & lock scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleAddToCart() {
    if (!buyable) return;
    add({
      productId: product.id as string,
      name: product.name,
      unitPrice: product.price as number,
      ...(product.image ? { image: product.image } : {}),
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  const orderMessage = `Hello ${site.shortName}, I want to order the: ${product.name}. Please confirm availability and pickup/delivery details.`;
  const enquiryMessage = `Hello ${site.shortName}, could you please give me the latest price, technical specifications, and photos for: ${product.name}?`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product preview"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-ink-200 bg-ink-50 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
        >
          <CloseIcon className="size-4" />
        </button>

        <div className="grid gap-6 sm:grid-cols-[1fr_1.2fr]">
          {/* Product Media */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-ink-100">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
              />
            ) : (
              <div className="relative grid size-full place-items-center bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900">
                <Icon className="size-20 text-brand-300" />
              </div>
            )}
            {product.badge ? (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/90 px-3 py-1 text-xs font-bold text-white shadow">
                {product.badge}
              </span>
            ) : null}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
                {product.category}
              </span>
              <h3 id="modal-product-title" className="mt-2 text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
                {product.name}
              </h3>
              <p className="mt-2 text-2xl font-extrabold tracking-tight text-brand-700">
                {buyable ? formatKsh(product.price as number) : "Price on Request"}
              </p>

              <p className="mt-3 text-sm leading-6 text-ink-600">
                {product.description}
              </p>

              {/* Machinery Trust Points */}
              <ul className="mt-4 space-y-1.5 border-t border-ink-100 pt-3 text-xs text-ink-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 text-emerald-600 shrink-0" />
                  <span>Inspected &amp; run-tested before handover</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 text-emerald-600 shrink-0" />
                  <span>Genuine spare parts in stock at shop</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 text-emerald-600 shrink-0" />
                  <span>Collect in Nairobi or dispatch via upcountry bus parcel</span>
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              {buyable ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-5 py-3.5 text-sm font-bold text-white shadow transition hover:bg-ink-800 active:scale-[0.99]"
                >
                  <CartIcon className="size-4" />
                  {added ? "Added to your cart ✓" : "Add to cart"}
                </button>
              ) : null}

              <a
                href={whatsappLink(buyable ? orderMessage : enquiryMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow transition hover:bg-[#20ba5a] active:scale-[0.99]"
              >
                <WhatsAppIcon className="size-4" />
                {buyable ? "Order directly on WhatsApp" : "Ask for Price & Specs on WhatsApp"}
              </a>

              <a
                href={`tel:${primaryPhone.tel}`}
                className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-ink-500 hover:text-ink-900"
              >
                <PhoneIcon className="size-3.5 text-emerald-600" />
                Or call shop: {primaryPhone.label}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------
function ProductCard({
  product,
  onSelect,
}: {
  product: PublicProduct;
  onSelect: (product: PublicProduct) => void;
}) {
  const Icon = productIconMap[product.icon];
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const buyable = Boolean(product.id) && typeof product.price === "number" && product.price > 0;

  function addToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (!buyable) return;
    add({
      productId: product.id as string,
      name: product.name,
      unitPrice: product.price as number,
      ...(product.image ? { image: product.image } : {}),
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  const orderMessage = `Hello ${site.shortName}, I want to order the: ${product.name}. Please confirm availability and payment/delivery details.`;
  const enquiryMessage = `Hello ${site.shortName}, could you please give me current pricing and specs for: ${product.name}?`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      {/* Clickable Image Section */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(product)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(product);
          }
        }}
        className="relative h-48 w-full cursor-pointer overflow-hidden bg-ink-100 focus:outline-none"
        aria-label={`View details for ${product.name}`}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="relative grid h-48 place-items-center overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900">
            <div
              className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:22px_22px]"
              aria-hidden="true"
            />
            <Icon className="relative size-14 text-brand-300 transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}

        {product.badge ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-900/85 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-sm">
            {product.badge}
          </span>
        ) : null}

        {/* Quick View overlay hint */}
        <span className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-center rounded-lg bg-ink-950/75 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          Quick View &amp; Specs
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex self-start rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
          {product.category}
        </span>

        <h3
          role="button"
          tabIndex={0}
          onClick={() => onSelect(product)}
          className="mt-3 cursor-pointer text-lg font-semibold tracking-tight text-ink-900 hover:text-brand-700"
        >
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-ink-500 line-clamp-3">{product.description}</p>

        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-ink-100 pt-3">
          <span className="text-lg font-bold tracking-tight text-ink-900">
            {buyable ? formatKsh(product.price as number) : "Price on request"}
          </span>
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="text-xs font-bold text-brand-700 hover:underline"
          >
            Specs &rarr;
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          {buyable ? (
            <>
              <button
                type="button"
                onClick={addToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-ink-700 active:scale-[0.98]"
              >
                <CartIcon className="size-4" />
                {added ? "Added to cart ✓" : "Add to cart"}
              </button>
              <a
                href={whatsappLink(orderMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-[#25D366]"
              >
                <WhatsAppIcon className="size-3.5" />
                or order on WhatsApp
              </a>
            </>
          ) : (
            <a
              href={whatsappLink(enquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#20ba5a] active:scale-[0.98]"
            >
              <WhatsAppIcon className="size-4" />
              Ask for a price
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// ProductFilter (Search + filter buttons + sort + grid + modal)
// ---------------------------------------------------------------------------
interface ProductFilterProps {
  products: PublicProduct[];
}

export function ProductFilter({ products }: ProductFilterProps) {
  const [active, setActive] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);

  const visible = useMemo(() => {
    let result = products;

    // Filter by Category
    if (active !== "All") {
      result = result.filter((p) => p.category === active);
    }

    // Filter by Search Query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.badge && p.badge.toLowerCase().includes(query)),
      );
    }

    // Sort result
    return [...result].sort((a, b) => {
      if (sortBy === "price-asc") {
        const pA = typeof a.price === "number" ? a.price : Infinity;
        const pB = typeof b.price === "number" ? b.price : Infinity;
        return pA - pB;
      }
      if (sortBy === "price-desc") {
        const pA = typeof a.price === "number" ? a.price : -1;
        const pB = typeof b.price === "number" ? b.price : -1;
        return pB - pA;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0; // Default/featured
    });
  }, [active, searchQuery, sortBy, products]);

  const hasFilters = active !== "All" || Boolean(searchQuery.trim());

  function clearAllFilters() {
    setActive("All");
    setSearchQuery("");
    setSortBy("featured");
  }

  return (
    <div className="mt-8">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search machinery, compressors, spares..."
            className="w-full rounded-full border border-ink-200 bg-white py-2.5 pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              <CloseIcon className="size-4" />
            </button>
          ) : null}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-xs font-semibold text-ink-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-sm focus:border-brand-600 focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Filter pill buttons */}
      <div
        className="mt-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter products by category"
      >
        {categories.map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-ink-900 bg-ink-900 text-white shadow-sm"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900"
              }`}
            >
              {category}
            </button>
          );
        })}

        {hasFilters ? (
          <button
            type="button"
            onClick={clearAllFilters}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            Reset filters ✕
          </button>
        ) : null}
      </div>

      {/* Results summary counter */}
      <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
        <p>
          Showing <strong className="text-ink-900">{visible.length}</strong> {visible.length === 1 ? "product" : "products"}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
          {active !== "All" ? ` in ${active}` : ""}
        </p>
      </div>

      {/* Product grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.length > 0 ? (
          visible.map((product) => (
            <ProductCard
              key={product.name}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
            <p className="text-base font-semibold text-ink-900">No machinery found</p>
            <p className="text-sm text-ink-500 max-w-md">
              We couldn&apos;t find any items matching your filters.
              <br />
              Contact us directly on WhatsApp — we have more stock in our Nyanza House showroom.
            </p>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50"
              >
                Clear all filters
              </button>
              <a
                href={whatsappLink(`Hello ${site.shortName}, I am looking for machinery or tools not listed on your website.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#20ba5a]"
              >
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedProduct ? (
        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </div>
  );
}
