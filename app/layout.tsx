import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { CartProvider } from "@/lib/cart";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Machinery, Power Tools & Electronics in ${site.address.city}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "brush cutter Kenya",
    "rice mill Nairobi",
    "air compressor Nairobi",
    "power tools Nairobi",
    "water pump Kenya",
    "welding machine Nairobi",
    "generators Kenya",
    "hardware shop Nairobi",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#047a55",
};

/** Structured data so the shop can surface in local search and Maps results. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phones.map((phone) => phone.tel),
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.street}, ${site.address.area}`,
    addressLocality: site.address.city,
    addressCountry: site.address.countryCode,
  },
  openingHoursSpecification: site.openingHoursSpec.map((spec) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: spec.days,
    opens: spec.opens,
    closes: spec.closes,
  })),
  areaServed: site.address.city,
  knowsAbout: ["Brush cutters", "Rice mills", "Air compressors", "Generators", "Power tools"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <CartProvider>{children}</CartProvider>
        <script
          type="application/ld+json"
          // Static, author-controlled structured data.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
