/**
 * Single source of truth for every business detail on the site.
 * Edit this file — not the components — when shop information changes.
 */

export const site = {
  name: "Maggy City Tools and Electronics",
  shortName: "Maggy City",
  tagline: "Machines, tools & power solutions you can rely on.",
  description:
    "Maggy City Tools and Electronics supplies brush cutters, rice mills, air compressors, power tools, spare parts and electronics to homes, farms and businesses in Nairobi.",
  url: "https://maggycitytools.co.ke",
  foundedYear: 2015,

  address: {
    street: "Nyanza House, Shop No. 5",
    area: "Junction of Mfangano Street & Sheikh Karume Road",
    city: "Nairobi",
    country: "Kenya",
    countryCode: "KE",
    /**
     * What we hand to Google Maps, kept separate from the address shown to
     * customers. Feeding it the junction description put the pin in Tanzania:
     * "Junction of" is not geocodable and "Sheikh Karume" matches Tanzanian
     * places strongly enough to beat the ", Kenya" suffix. The building name
     * plus its street resolves unambiguously.
     */
    mapQuery: "Nyanza House, Mfangano Street, Nairobi, Kenya",
  },

  /** `tel` is dialable, `intl` is the E.164 form used for WhatsApp. */
  phones: [
    { label: "0713 337 799", tel: "+254713337799", intl: "254713337799", whatsapp: true },
  ],

  // TODO(owner): confirm trading hours.
  hours: [
    { days: "Monday – Friday", open: "8:00 AM", close: "6:30 PM" },
    { days: "Saturday", open: "8:00 AM", close: "5:00 PM" },
    { days: "Sunday", open: "Closed", close: null },
  ],

  /** Schema.org openingHours, kept in sync with `hours` above. */
  openingHoursSpec: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:30" },
    { days: ["Saturday"], opens: "08:00", closes: "17:00" },
  ],
} as const;

export const primaryPhone = site.phones[0];

export const fullAddress = `${site.address.street}, ${site.address.area}, ${site.address.city}, ${site.address.country}`;

export const mapsQuery = encodeURIComponent(site.address.mapQuery);

/** Opens the shop in the visitor's Maps app for turn-by-turn directions. */
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

export function whatsappLink(message: string) {
  return `https://wa.me/${primaryPhone.intl}?text=${encodeURIComponent(message)}`;
}

/**
 * Root-relative so the links keep working from sub-pages such as /admin and
 * /auth. On the home page the browser still treats these as same-document
 * fragment jumps, so nothing reloads.
 */
export const nav = [
  { label: "Home", href: "/#home" },
  { label: "Products", href: "/#products" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];
