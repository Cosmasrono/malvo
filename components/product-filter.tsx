"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { categories, type Category, type Product, type ProductIconKey } from "@/lib/products";
import { whatsappLink, site } from "@/lib/site";
import {
  ChatIcon,
  BladeIcon,
  GrainIcon,
  GaugeIcon,
  DropIcon,
  BoltIcon,
  SparkIcon,
  DiscIcon,
  PlugIcon,
  ToolIcon,
  WhatsAppIcon,
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

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------
function ProductCard({ product }: { product: Product }) {
  const Icon = productIconMap[product.icon];
  const orderMessage = `Hello ${site.shortName}, I want to order the: ${product.name}. Please confirm availability and payment/delivery details.`;
  const enquiryMessage = `Hello ${site.shortName}, could you please give me current pricing and specs for: ${product.name}?`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      {product.image ? (
        <div className="relative h-48 w-full overflow-hidden bg-ink-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge ? (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-900/85 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-sm">
              {product.badge}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="relative grid h-48 place-items-center overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900">
          <div
            className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:22px_22px]"
            aria-hidden="true"
          />
          <Icon className="relative size-14 text-brand-300 transition-transform duration-300 group-hover:scale-110" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
            {product.category}
          </span>
          <span className="text-[11px] font-medium text-ink-400">
            No login needed
          </span>
        </div>

        <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink-900">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-ink-500">{product.description}</p>
        
        <p className="mt-4 border-t border-ink-100 pt-3 text-xs font-medium text-ink-400">
          Ready in shop · Delivery across Nairobi
        </p>

        {/* WhatsApp Direct Order & Enquiry Actions */}
        <div className="mt-4 space-y-2">
          <a
            href={whatsappLink(orderMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#20ba5a] active:scale-[0.98]"
          >
            <WhatsAppIcon className="size-4" />
            Order on WhatsApp
          </a>

          <a
            href={whatsappLink(enquiryMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-ink-200 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-600 hover:text-brand-700"
          >
            <ChatIcon className="size-3.5" />
            Ask for a price
          </a>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// ProductFilter (filter buttons + grid)
// ---------------------------------------------------------------------------
interface ProductFilterProps {
  products: Product[];
}

export function ProductFilter({ products }: ProductFilterProps) {
  const [active, setActive] = useState<Category>("All");

  const visible = useMemo(
    () =>
      active === "All"
        ? products
        : products.filter((p) => p.category === active),
    [active, products],
  );

  return (
    <div className="mt-8">
      {/* Informational banner: ordering is direct via WhatsApp without needing login */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#25D366] text-white">
            <WhatsAppIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">
              Direct WhatsApp Ordering — No registration or login required
            </p>
            <p className="text-xs text-ink-600">
              Tap &quot;Order on WhatsApp&quot; on any machine to chat with us directly, agree on price, and schedule pickup or delivery.
            </p>
          </div>
        </div>
        <a
          href={whatsappLink(`Hello ${site.shortName}, I would like to enquire about machines available in stock.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full border border-emerald-600/30 bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
        >
          Quick Chat
        </a>
      </div>

      {/* Filter pill buttons */}
      <div
        className="flex flex-wrap gap-2"
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
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.length > 0 ? (
          visible.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
            <p className="text-base font-semibold text-ink-900">Nothing here yet</p>
            <p className="text-sm text-ink-500">
              No products listed under <strong>{active}</strong> at the moment.
              <br />
              Contact us on WhatsApp — we may be able to source it for you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
