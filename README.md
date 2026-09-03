# Maggy City Tools and Electronics

Marketing site for a machinery, power tools and electronics retailer in Dar es Salaam.
Built with Next.js 16 (App Router), React 19 and Tailwind CSS v4.

## Development

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm lint
```

## Editing the site

Almost every change you will want to make lives in two files — you should not need to
touch the components.

| What to change | File |
| --- | --- |
| Shop name, address, phone numbers, opening hours, nav links | [lib/site.ts](lib/site.ts) |
| Product catalogue and categories | [lib/products.ts](lib/products.ts) |
| Colours, fonts, shadows | [app/globals.css](app/globals.css) (`@theme` block) |

`lib/site.ts` is the single source of truth: it feeds the header, footer, contact section,
the Google Maps embed, the WhatsApp deep links and the `HardwareStore` structured data
in [app/layout.tsx](app/layout.tsx).

### Adding product photos

Product cards fall back to a branded icon tile when no photo is set. To use a real photo,
drop the file into `public/products/` and set the `image` field on that product:

```ts
{
  name: "Brush Cutter Machines",
  image: "/products/brush-cutter.jpg",
  // ...
}
```

Landscape images around 800×600 work best.

## Before going live

- [ ] Confirm the opening hours in `lib/site.ts` (currently a placeholder).
- [ ] Confirm the city / postal line in `lib/site.ts`.
- [ ] Set `site.url` to the real domain — it drives canonical URLs, OpenGraph and the sitemap.
- [ ] Replace the icon tiles with real shop photography.
- [ ] Verify the Google Maps embed lands on the right pin; if not, paste exact coordinates
      into `mapsQuery`.

## Structure

```
app/         layout (fonts, SEO, JSON-LD), page, globals.css, robots.ts, sitemap.ts
components/  site-header, site-footer, product-catalog, whatsapp-fab, ui, icons
lib/         site.ts (business data), products.ts (catalogue)
```
