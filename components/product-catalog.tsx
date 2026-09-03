import { Container, SectionHeading } from "@/components/ui";
import { products } from "@/lib/products";
import { ProductFilter } from "@/components/product-filter";

/**
 * Server Component — fully rendered HTML is sent to the browser so search
 * engines can index products without executing any JavaScript.
 *
 * The filter buttons require client-side state, so they are isolated in the
 * thin <ProductFilter> client wrapper. The product *data* (pure JSON, no
 * function references) is passed as props across the boundary.
 */
export function ProductCatalog() {
  return (
    <section id="products" className="scroll-mt-28 py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="What we stock"
            title="Machinery and tools, ready off the shelf"
            intro="Everything below is stocked or sourced to order. Tell us the job and we will match you to the right machine and the spares that keep it running."
          />

          <div className="flex flex-col items-start gap-4 md:items-end">
            <p className="text-sm font-medium text-ink-500">
              <span className="font-bold text-ink-900">{products.length}</span> product categories
            </p>
          </div>
        </div>

        {/* ProductFilter is a client component that owns filtering + the grid */}
        <ProductFilter products={products} />
      </Container>
    </section>
  );
}
