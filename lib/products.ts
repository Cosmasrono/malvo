/**
 * Product catalog types and the starter catalogue.
 *
 * This module is imported by client components, so it must stay free of any
 * database or Node-only imports. Live catalogue reads live in `lib/catalog.ts`.
 *
 * `starterProducts` is the shipped-with-the-site list. Once the shop owner
 * imports it from /admin, the database becomes the source of truth and this
 * array is only used as a fallback when the catalogue is empty.
 */

export const categories = [
  "All",
  "Agricultural",
  "Workshop",
  "Electronics",
  "Power Tools",
] as const;

export type Category = (typeof categories)[number];

/** Keys must match the `productIconMap` in `components/product-filter.tsx`. */
export type ProductIconKey =
  | "BladeIcon"
  | "GrainIcon"
  | "GaugeIcon"
  | "DropIcon"
  | "BoltIcon"
  | "SparkIcon"
  | "DiscIcon"
  | "PlugIcon"
  | "ToolIcon";

export type Product = {
  name: string;
  description: string;
  category: Exclude<Category, "All">;
  icon: ProductIconKey;
  image?: string;
  badge?: string;
  /** Whole shillings. Null/undefined means "ask us" — it cannot be bought online. */
  price?: number | null;
};

/**
 * A product as the public catalogue sees it. `id` is only present for rows
 * that came from the database; the shipped starter list has none, which is
 * also why those items cannot be added to a cart.
 */
export type PublicProduct = Product & { id?: string };

export const starterProducts: Product[] = [
  {
    name: "Backpack Brush Cutter Machine",
    description:
      "Flexible-shaft backpack petrol brush cutter with complete multi-blade kit: circular saw blades, star blade, 2-tooth blade, and trimmer head for land clearing, grass and crop harvesting.",
    category: "Agricultural",
    icon: "BladeIcon",
    image: "/products/backpack-brush-cutter.jpg",
    badge: "In Stock · Full Blade Kit",
  },
  {
    name: "Milano 50L Air Compressor",
    description:
      "Milano Italy Technology 50 Litres direct-drive twin V-cylinder air compressor with pressure switch, dual pressure gauges, safety relief valve and transport wheels for workshop use.",
    category: "Workshop",
    icon: "GaugeIcon",
    image: "/products/milano-50l-compressor.jpg",
    badge: "Milano Italy 50L",
  },
  {
    name: "AICS Combined Rice & Maize Mill",
    description:
      "Heavy-duty double hopper combined milling machine: precision rice husker and polisher on one side, and high-output maize/grain grinder on the other. Fitted on sturdy red steel stand.",
    category: "Agricultural",
    icon: "GrainIcon",
    image: "/products/aics-rice-maize-mill.jpg",
    badge: "2-in-1 Combined Mill",
  },
  {
    name: "Milano 500L Industrial Air Compressor",
    description:
      "Commercial 500 Litres Milano Italia air compressor with heavy-duty 7.5 HP motor, high-capacity 3-cylinder belt-drive pump, full protective cage, and 4-wheel mobile base.",
    category: "Workshop",
    icon: "GaugeIcon",
    image: "/products/milano-500l-compressor.jpg",
    badge: "7.5 HP · 500L Tank",
  },
  {
    name: "BAKKU BK-660 Precision Screwdriver Set",
    description:
      "Original BAKKU BK-660 6-piece precision screwdriver set with ergonomic non-slip grips and magnetic tips for mobile phone repair, telecom gear, laptops, and precision electronics.",
    category: "Electronics",
    icon: "ToolIcon",
    image: "/products/bakku-screwdriver-set.jpg",
    badge: "BAKKU Original Set",
  },
  {
    name: "Water Pumps (Petrol & Electric)",
    description:
      "High-pressure water pumps for irrigation, agricultural dewatering, and construction site water transfer. Supplied with matching fittings and hoses.",
    category: "Agricultural",
    icon: "DropIcon",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Heavy-Duty Generating Sets",
    description:
      "Petrol and diesel generators from 2.5kVA to 10kVA for workshops, commercial premises, and residential backup with clean, stable power output.",
    category: "Power Tools",
    icon: "BoltIcon",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Inverter Welding Machines",
    description:
      "Digital arc and TIG inverter welders with welding cables, electrode holder, earth clamp, and face mask. Lightweight and energy efficient for site fabrication.",
    category: "Workshop",
    icon: "SparkIcon",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Grinders & Power Drills",
    description:
      "Professional 115mm & 230mm angle grinders, hammer drills, impact wrenches, and diamond cutting discs for heavy metal and masonry work.",
    category: "Power Tools",
    icon: "DiscIcon",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Electrical Accessories & Cables",
    description:
      "Heavy gauge copper cables, industrial sockets, distribution boxes, circuit breakers, multi-outlet extension drums, and shop accessories.",
    category: "Electronics",
    icon: "PlugIcon",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=85",
  },
];

/** Kept for callers that only need the shipped list (fallback rendering). */
export const products = starterProducts;

export const productIconKeys: ProductIconKey[] = [
  "BladeIcon",
  "GrainIcon",
  "GaugeIcon",
  "DropIcon",
  "BoltIcon",
  "SparkIcon",
  "DiscIcon",
  "PlugIcon",
  "ToolIcon",
];

/** Categories a product can actually be filed under ("All" is filter-only). */
export const assignableCategories = categories.filter(
  (category): category is Exclude<Category, "All"> => category !== "All",
);

/** A catalogue row as the admin screen sees it (includes unpublished items). */
export type AdminProduct = Product & {
  id: string;
  published: boolean;
  sortOrder: number;
};
