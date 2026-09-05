import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui";
import { ProductManager } from "@/components/admin/product-manager";
import { getAdminUser, getSessionUser } from "@/lib/auth";
import { getAllProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Product admin",
  robots: { index: false, follow: false },
};

// Always reflects the current database state, never a cached copy.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdminUser();

  if (!admin) {
    // Signed in but not an admin gets an explanation; everyone else signs in.
    const user = await getSessionUser();
    if (!user) redirect("/auth");

    return (
      <>
        <SiteHeader />
        <main id="main" className="flex-1 py-24">
          <Container className="max-w-xl text-center">
            <p className="eyebrow">Restricted</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">
              This area is for shop staff
            </h1>
            <p className="mt-4 text-base leading-7 text-ink-500">
              You are signed in as <strong>{user.email}</strong>, which does not have
              admin rights. Ask the shop owner to add your address to{" "}
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-sm">ADMIN_EMAILS</code>.
            </p>
            <Link href="/" className="mt-8 inline-block text-sm font-semibold text-brand-700 hover:underline">
              ← Back to the shop
            </Link>
          </Container>
        </main>
        <SiteFooter />
      </>
    );
  }

  const products = await getAllProducts();

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 py-12 sm:py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{site.shortName} admin</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Product manager
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500">
                Add, edit, hide or remove anything shown on the shop catalogue.
                Changes appear on the public site immediately.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="text-sm text-ink-400">
                Signed in as <span className="font-semibold text-ink-700">{admin.email}</span>
              </p>
              <div className="flex gap-4">
                <Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">
                  Orders →
                </Link>
                <Link href="/#products" className="text-sm font-semibold text-brand-700 hover:underline">
                  View the shop →
                </Link>
              </div>
            </div>
          </div>

          <ProductManager initialProducts={products} />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
