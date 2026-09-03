import { nav, site } from "@/lib/site";
import { ClockIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { Container, Logo } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-900 text-ink-300">
      <Container className="py-14">
        {/* Main Footer Grid */}
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand & Description: Takes full width on mobile, 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="text-base font-bold tracking-tight text-white">{site.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink-300">
              A dependable supplier of agricultural machinery, power tools, workshop equipment and
              electrical accessories for {site.address.city} and beyond.
            </p>
          </div>

          {/* Links & Contact: Always 2 columns side-by-side even on small devices */}
          <div className="grid grid-cols-2 gap-6 sm:gap-10 lg:col-span-2">
            <nav aria-label="Footer">
              <h3 className="text-sm font-semibold text-white">Explore</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="transition-colors hover:text-brand-300">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h3 className="text-sm font-semibold text-white">Visit or call</h3>
              <ul className="mt-4 space-y-4 text-xs sm:text-sm">
                <li className="flex gap-2.5">
                  <PinIcon className="mt-0.5 size-4 shrink-0 text-brand-400" />
                  <span className="leading-snug">
                    {site.address.street}
                    <br />
                    {site.address.area}
                    <br />
                    {site.address.city}, {site.address.country}
                  </span>
                </li>
                {site.phones.map((phone) => (
                  <li key={phone.tel} className="flex gap-2.5">
                    <PhoneIcon className="mt-0.5 size-4 shrink-0 text-brand-400" />
                    <a href={`tel:${phone.tel}`} className="hover:text-brand-300">
                      {phone.label}
                    </a>
                  </li>
                ))}
                <li className="flex gap-2.5">
                  <ClockIcon className="mt-0.5 size-4 shrink-0 text-brand-400" />
                  <span>Mon–Sat, Sun closed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>{site.address.city}, {site.address.country}</p>
        </div>
      </Container>
    </footer>
  );
}
