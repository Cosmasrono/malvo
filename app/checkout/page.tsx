import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui";
import { CheckoutClient } from "@/components/checkout-client";
import { payheroConfigured } from "@/lib/payhero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Checkout",
  description: `Pay for your ${site.shortName} order with M-Pesa.`,
  robots: { index: false, follow: false },
};

// Whether payment is switched on depends on server env, not on build output.
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 py-12 sm:py-16">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow">Checkout</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Pay with M-Pesa
            </h1>
            <p className="mt-3 text-base leading-7 text-ink-500">
              Confirm your order and we will send an M-Pesa prompt to your phone.
              No account needed — you only enter your PIN.
            </p>
          </div>

          <div className="mt-10">
            <CheckoutClient paymentsEnabled={payheroConfigured()} />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
