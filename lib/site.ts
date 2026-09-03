/**
 * Single source of truth for every business detail on the site.
 * Edit this file — not the components — when shop information changes.
 */

export const site = {
  name: "Maggy City Tools and Electronics",
  shortName: "Maggy City",
  tagline: "Machines, tools & power solutions you can rely on.",
  description:
    "Maggy City Tools and Electronics supplies brush cutters, rice mills, air compressors, power tools, spare parts and electronics to homes, farms and businesses in Dar es Salaam.",
  url: "https://maggycitytools.co.tz",
  foundedYear: 2015,

  // TODO(owner): confirm the postal/city line before launch.
  address: {
    street: "Nyanza House, Shop No. 5",
    area: "Junction of Mfangano Street & Sheikh Karume Road",
    city: "Dar es Salaam",
    country: "Tanzania",
    countryCode: "TZ",
  },

  /** `tel` is dialable, `intl` is the E.164 form used for WhatsApp. */
  phones: [
    { label: "0713 337 799", tel: "+255713337799", intl: "255713337799", whatsapp: true },
    { label: "0780 337 799", tel: "+255780337799", intl: "255780337799", whatsapp: false },
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

export const mapsQuery = encodeURIComponent(
  `${site.address.area}, ${site.address.city}, ${site.address.country}`,
);

export function whatsappLink(message: string) {
  return `https://wa.me/${primaryPhone.intl}?text=${encodeURIComponent(message)}`;
}

export const nav = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#products" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];
