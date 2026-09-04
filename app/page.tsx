import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCatalog } from "@/components/product-catalog";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { buttonStyles, Container, SectionHeading } from "@/components/ui";
import {
  BladeIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  GaugeIcon,
  GrainIcon,
  PhoneIcon,
  PinIcon,
  ShieldIcon,
  ToolIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { mapsQuery, site, whatsappLink, primaryPhone } from "@/lib/site";
import { products } from "@/lib/products";

// Hero quick stats
const stats = [
  { value: `${new Date().getFullYear() - site.foundedYear}+`, label: "Years Serving Trade" },
  { value: "500+", label: "Machines Delivered" },
  { value: "100%", label: "Genuine Spares Stocked" },
  { value: "Dar & Upcountry", label: "Daily Bus Cargo Dispatch" },
];

// Why choose Maggy City
const values = [
  {
    icon: ShieldIcon,
    title: "Heavy-Duty Equipment That Lasts",
    body: "Every machine in our shop is selected for commercial durability, easy servicing in local conditions, and continuous spare parts availability.",
  },
  {
    icon: ChatIcon,
    title: "Honest Capacity Sizing",
    body: "Tell us your workshop or farm workload. We calculate generator, pump, and compressor capacity so you buy the right machine the first time.",
  },
  {
    icon: ToolIcon,
    title: "Spares Kept on the Shelf",
    body: "Blades, discs, pistons, belts, filters, capacitors, and switches — the consumables that keep you earning are kept in stock, not ordered later.",
  },
  {
    icon: TruckIcon,
    title: "Dar es Salaam & Regional Delivery",
    body: "Collect same-day from our shop at Nyanza House or arrange delivery anywhere in Dar es Salaam and via cargo bus parcels across Tanzania.",
  },
];

// Ordering steps
const orderSteps = [
  {
    step: "01",
    title: "Choose Your Equipment",
    desc: "Browse our machinery catalog online or describe your daily task to our equipment specialists.",
  },
  {
    step: "02",
    title: "Chat & Order on WhatsApp",
    desc: "No account or registration required! Get immediate price confirmation, technical specs, and photos.",
  },
  {
    step: "03",
    title: "Tested & Handed Over",
    desc: "Collect from our shop or get same-day delivery in Dar es Salaam / parcel bus upcountry.",
  },
];

// Upcountry destinations
const upcountryHubs = [
  "Mwanza",
  "Arusha",
  "Dodoma",
  "Mbeya",
  "Morogoro",
  "Tanga",
  "Moshi",
  "Zanzibar",
  "Iringa",
  "Tabora",
];

// FAQs
const faqs = [
  {
    q: "Do I need an account or registration to order?",
    a: "No! You do not need to register. You can tap 'Order on WhatsApp' on any product to chat directly with our sales team and complete your order immediately.",
  },
  {
    q: "Are replacement parts available for the machines you sell?",
    a: "Yes. We stock genuine and compatible spares for all machines we carry — including brush cutter blades, belts, compressor valves, switches, and mill screens.",
  },
  {
    q: "Can you send equipment outside Dar es Salaam?",
    a: "Yes. We arrange secure parcel dispatches daily via reputable bus lines and cargo trucks to all regions of Tanzania.",
  },
  {
    q: "Do you test machines before handover?",
    a: "Always. Every petrol engine, compressor, and milling unit is inspected, oiled, and run before you leave the shop so it is 100% ready to work on day one.",
  },
];

// Customer reviews
const testimonials = [
  {
    quote:
      "I bought the Milano 500L compressor for my spray painting and tyre shop in Tabata. The build quality and pressure retention are outstanding. Delivered same day!",
    author: "Juma M. — Workshop Owner, Tabata",
    rating: "★★★★★",
  },
  {
    quote:
      "The backpack brush cutter came with all the blades and harness. We cleared 3 acres of bush without a single issue. Honest people who give straight answers.",
    author: "Rashid K. — Farm Supervisor, Bagamoyo",
    rating: "★★★★★",
  },
  {
    quote:
      "Ordered the 2-in-1 rice and maize mill sent to Morogoro via bus parcel. It arrived the next morning intact and running smoothly. Highly recommended.",
    author: "Emanuel S. — Grain Miller, Morogoro",
    rating: "★★★★★",
  },
];

export default function Home() {
  // Grab the 5 real photographed products
  const featuredProducts = products.filter((p) => p.image?.startsWith("/products/"));

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* ========================================================================= */}
        {/* HERO SECTION WITH PROFESSIONAL BACKGROUND IMAGE                          */}
        {/* ========================================================================= */}
        <section id="home" className="relative scroll-mt-28 overflow-hidden bg-ink-950 text-white">
          {/* Background Image with layered gradient overlays */}
          <div className="absolute inset-0 z-0 select-none">
            <Image
              src="/images/hero-bg.jpg"
              alt="Maggy City Tools and Electronics Showroom"
              fill
              priority
              quality={90}
              className="object-cover object-center"
            />
            {/* Dark industrial gradient overlays for readability and atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/75" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/50" />
            <div
              className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.2)_1px,transparent_0)] [background-size:24px_24px]"
              aria-hidden="true"
            />
          </div>

          <Container className="relative z-10 py-16 sm:py-20 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              {/* Left Column: Value proposition */}
              <div>
                <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
                  Heavy-Duty Machinery, Tools &amp; Power Solutions You Can Rely On.
                </h1>

                <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-ink-200 sm:text-lg sm:leading-8">
                  Direct suppliers of commercial air compressors, agricultural milling machinery, petrol brush cutters, generators, and precision power tools to farms, garages, and workshops across Tanzania — with in-stock spare parts and honest sizing advice.
                </p>

                {/* Direct action buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href={whatsappLink(`Hello ${site.shortName}, I would like to order equipment or make an enquiry.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-[#20ba5a] active:scale-[0.98]"
                  >
                    <WhatsAppIcon className="size-5" />
                    Order on WhatsApp (Direct)
                  </a>

                  <a
                    href="#products"
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Browse Machinery Catalog
                  </a>

                  <a
                    href={`tel:${primaryPhone.tel}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink-300 transition hover:text-white"
                  >
                    <PhoneIcon className="size-4 text-emerald-400" />
                    {primaryPhone.label}
                  </a>
                </div>

                {/* Micro reassurance badges */}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-ink-300">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 text-emerald-400" /> No account required to order
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 text-emerald-400" /> Tested before handover
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 text-emerald-400" /> Same-day dispatch &amp; collection
                  </span>
                </div>

                {/* Trust stats strip */}
                <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-white/15 pt-8 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <dt className="text-xl font-bold tracking-tight text-white lg:text-2xl">{stat.value}</dt>
                      <dd className="mt-1 text-[11px] leading-4 text-ink-300">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Right Column: Hero Equipment Spotlight Card */}
              <div className="relative">
                <div className="relative rounded-3xl border border-white/15 bg-ink-900/90 p-5 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Shop Floor Spotlight
                      </span>
                      <h2 className="text-lg font-bold text-white">Direct From Our Shop Floor</h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      In Stock Today
                    </span>
                  </div>

                  {/* Featured Product Preview grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {featuredProducts.slice(0, 4).map((product) => (
                      <a
                        key={product.name}
                        href={whatsappLink(`Hello ${site.shortName}, I saw the ${product.name} on your website and want to check price and availability.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800/80 p-3 transition hover:border-emerald-500/50 hover:bg-ink-800"
                      >
                        <div className="relative h-28 w-full overflow-hidden rounded-xl bg-ink-950">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 50vw, 25vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : null}
                          {product.badge ? (
                            <span className="absolute bottom-1.5 left-1.5 z-10 rounded bg-ink-950/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              {product.badge}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 text-xs font-bold leading-snug text-white line-clamp-1 group-hover:text-emerald-300">
                          {product.name}
                        </p>
                        <span className="mt-1 text-[10px] font-semibold text-emerald-400">
                          WhatsApp for Price →
                        </span>
                      </a>
                    ))}
                  </div>

                  {/* Bottom reassurance card */}
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <PinIcon className="size-4 text-emerald-400" />
                      <span className="text-ink-200">Visit us at Nyanza House, Dar es Salaam</span>
                    </div>
                    <a
                      href="#contact"
                      className="font-bold text-emerald-300 hover:text-emerald-200"
                    >
                      View Map &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ========================================================================= */}
        {/* NEW SECTION: FEATURED SHOP FLOOR EQUIPMENT HIGHLIGHTS                    */}
        {/* ========================================================================= */}
        <section className="border-b border-ink-200/70 bg-white py-16 sm:py-20">
          <Container>
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Featured Machinery</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                  Popular Equipment In Stock
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
                  Fresh arrivals photographed directly in our showroom. Ready for collection or delivery.
                </p>
              </div>
              <a
                href="#products"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800"
              >
                View full catalog ({products.length} items) &rarr;
              </a>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-paper shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-ink-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : null}
                    {item.badge ? (
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-900/90 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                      {item.category}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-ink-900">{item.name}</h3>
                    <p className="mt-2 flex-1 text-xs leading-5 text-ink-500">{item.description}</p>

                    <div className="mt-5 space-y-2 border-t border-ink-100 pt-4">
                      <a
                        href={whatsappLink(`Hello ${site.shortName}, I want to order the: ${item.name}. Please confirm price and delivery.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#20ba5a]"
                      >
                        <WhatsAppIcon className="size-4" />
                        Order on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ========================================================================= */}
        {/* NEW SECTION: 3-STEP ORDERING GUIDE (NO LOGIN REQUIRED)                    */}
        {/* ========================================================================= */}
        <section className="border-b border-ink-200/70 bg-ink-900 py-16 text-white sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow !text-emerald-400">Fast &amp; Simple</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                How Ordering Works
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-300">
                You do <strong>not</strong> need to register or sign up. Here is how simple it is to get your machinery:
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {orderSteps.map((step) => (
                <div
                  key={step.step}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <span className="text-3xl font-extrabold text-emerald-400">{step.step}</span>
                  <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-ink-300">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href={whatsappLink(`Hello ${site.shortName}, I want to inquire about purchasing equipment.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#20ba5a]"
              >
                <WhatsAppIcon className="size-4" />
                Start Order on WhatsApp Now
              </a>
            </div>
          </Container>
        </section>

        {/* ========================================================================= */}
        {/* COMPLETE PRODUCT CATALOG SECTION                                         */}
        {/* ========================================================================= */}
        <ProductCatalog />

        {/* ========================================================================= */}
        {/* WHY CHOOSE MAGGY CITY (VALUES & CAPABILITIES)                            */}
        {/* ========================================================================= */}
        <section id="about" className="scroll-mt-28 border-y border-ink-200/70 bg-white py-20 sm:py-24">
          <Container>
            <SectionHeading
              eyebrow="Why Maggy City"
              title="Built for hardworking people and reliable businesses"
              intro="Quality machinery should be easy to access, fairly priced, and backed by genuine spare parts and knowledgeable guidance."
            />

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-ink-200/70 bg-paper p-6 shadow-sm">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-bold tracking-tight text-ink-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ========================================================================= */}
        {/* UPCOUNTRY DELIVERY CARGO HUBS STRIP                                      */}
        {/* ========================================================================= */}
        <section className="border-b border-ink-200/70 bg-brand-900 py-14 text-white">
          <Container>
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-3 py-1 text-xs font-semibold text-brand-200">
                  <TruckIcon className="size-4 text-emerald-400" /> Regional Delivery Hubs
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Daily Cargo Dispatch Across Tanzania
                </h2>
                <p className="mt-2 text-sm leading-6 text-brand-200">
                  Outside Dar es Salaam? We safely package, inspect, and dispatch machinery daily via established bus and truck cargo lines.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {upcountryHubs.map((hub) => (
                    <span
                      key={hub}
                      className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white shadow-sm"
                    >
                      📍 {hub}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-brand-200">
                  Same-day handover to cargo carriers. Tracking details sent to you on WhatsApp immediately.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ========================================================================= */}
        {/* TESTIMONIALS & TRADE REVIEWS                                              */}
        {/* ========================================================================= */}
        <section className="border-b border-ink-200/70 bg-paper py-20 sm:py-24">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="Customer Reviews"
              title="Trusted by Contractors, Garages &amp; Farmers"
              intro="Here is what trade customers and machinery operators have to say about working with Maggy City."
            />

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {testimonials.map((review) => (
                <div
                  key={review.author}
                  className="flex flex-col justify-between rounded-2xl border border-ink-200/70 bg-white p-6 shadow-card"
                >
                  <div>
                    <div className="text-amber-500">{review.rating}</div>
                    <p className="mt-3 text-sm leading-6 text-ink-700 italic">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                  </div>
                  <div className="mt-6 border-t border-ink-100 pt-4">
                    <p className="text-xs font-bold text-ink-900">{review.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ========================================================================= */}
        {/* FAQS ACCORDION                                                            */}
        {/* ========================================================================= */}
        <section className="border-b border-ink-200/70 bg-white py-20 sm:py-24">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="Got Questions?"
              title="Frequently Asked Questions"
              intro="Quick answers to common questions about purchasing, delivery, and spare parts."
            />

            <div className="mx-auto mt-12 max-w-3xl divide-y divide-ink-200">
              {faqs.map((faq) => (
                <div key={faq.q} className="py-5">
                  <h3 className="text-base font-bold text-ink-900">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ========================================================================= */}
        {/* CONTACT & STORE LOCATION                                                 */}
        {/* ========================================================================= */}
        <section id="contact" className="scroll-mt-28 bg-ink-900 py-20 text-white sm:py-24">
          <Container>
            <SectionHeading
              tone="dark"
              eyebrow="Visit Our Shop"
              title="Visit Our Shop or Call Us Today"
              intro="We are ready to inspect machines with you, recommend the exact model for your workload, and supply the spares you need."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:col-span-2 lg:col-span-1">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
                    <PinIcon className="size-4" /> Shop Location
                  </span>
                  <p className="mt-3 text-lg font-semibold leading-7 text-white">{site.address.street}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-300">
                    {site.address.area}
                    <br />
                    {site.address.city}, {site.address.country}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
                    <PhoneIcon className="size-4" /> Phone Lines
                  </span>
                  <div className="mt-3 space-y-2">
                    {site.phones.map((phone) => (
                      <a
                        key={phone.tel}
                        href={`tel:${phone.tel}`}
                        className="block text-lg font-semibold text-white hover:text-brand-300"
                      >
                        {phone.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
                    <ClockIcon className="size-4" /> Working Hours
                  </span>
                  <dl className="mt-3 space-y-2 text-sm">
                    {site.hours.map((entry) => (
                      <div key={entry.days} className="flex justify-between gap-4">
                        <dt className="text-ink-300">{entry.days}</dt>
                        <dd className="font-medium text-white">
                          {entry.close ? `${entry.open} – ${entry.close}` : entry.open}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-1">
                  <a
                    href={whatsappLink(`Hello ${site.shortName}, I want to make an enquiry about your equipment.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#20ba5a]"
                  >
                    <WhatsAppIcon className="size-4" />
                    Message on WhatsApp
                  </a>
                  <a href={`tel:${site.phones[0].tel}`} className={buttonStyles.ghostOnDark}>
                    <PhoneIcon className="size-4" />
                    Call shop now
                  </a>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <iframe
                  title={`Map showing the location of ${site.name}`}
                  src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-80 w-full border-0 lg:h-full lg:min-h-[26rem]"
                />
              </div>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-sm text-ink-300">
              {["Walk-in trade welcome", "Bulk & contractor supply", "Daily regional bus parcel dispatches", "All spare parts stocked"].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <CheckIcon className="size-4 text-brand-400" />
                  {item}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </>
  );
}
