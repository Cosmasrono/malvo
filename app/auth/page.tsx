import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";
import { Container } from "@/components/ui";
import { whatsappLink, site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

export default function AuthPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Customer account</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Stay connected with your tools &amp; equipment.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-ink-500">
              Create an optional account to save your username, keep details ready for quotes, and manage your equipment history with {site.shortName}.
            </p>

            {/* Clear callout: ordering does NOT require an account */}
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div className="flex items-start gap-3">
                <WhatsAppIcon className="mt-0.5 size-5 shrink-0 text-[#25D366]" />
                <div>
                  <p className="text-sm font-bold text-ink-900">
                    Just want to order equipment?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink-600">
                    You do <strong>not</strong> need to register or sign in to purchase anything. You can chat, request price quotes, and order directly on WhatsApp.
                  </p>
                  <a
                    href={whatsappLink(`Hello ${site.shortName}, I want to make an inquiry or order without an account.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#20ba5a]"
                  >
                    <WhatsAppIcon className="size-3.5" />
                    Order directly via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
          <AuthForm />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}