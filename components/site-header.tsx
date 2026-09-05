"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nav, primaryPhone, site } from "@/lib/site";
import { ClockIcon, GearIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { buttonStyles, Container, Logo } from "@/components/ui";

interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  isAdmin?: boolean;
}

/** Derive a human-readable weekday hours string from the structured site data. */
function weekdayHours(): string {
  const weekday = site.hours.find((h) => h.days.startsWith("Monday"));
  if (!weekday || !weekday.close) return "";
  return `${weekday.open} – ${weekday.close}`;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Fetch current user session
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signout" }),
    });
    setUser(null);
    window.location.reload();
  }

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const displayName = user?.username ? `@${user.username}` : user?.email?.split("@")[0];

  return (
    <header className="sticky top-0 z-40">
      {/* Utility strip: the three things a walk-in customer looks for first. */}
      <div className="hidden bg-ink-900 text-ink-300 md:block">
        <Container className="flex items-center justify-between py-2 text-xs">
          <p className="inline-flex items-center gap-2">
            <PinIcon className="size-4 text-brand-400" />
            {site.address.street} · {site.address.area}
          </p>
          <div className="flex items-center gap-6">
            <p className="inline-flex items-center gap-2">
              <ClockIcon className="size-4 text-brand-400" />
              Mon–Fri {weekdayHours()}
            </p>
            <a
              href={`tel:${primaryPhone.tel}`}
              className="inline-flex items-center gap-2 font-medium text-white hover:text-brand-300"
            >
              <PhoneIcon className="size-4 text-brand-400" />
              {primaryPhone.label}
            </a>
          </div>
        </Container>
      </div>

      <div className="border-b border-ink-200/80 bg-paper/85 backdrop-blur-md">
        <Container className="flex items-center justify-between gap-4 py-3">
          <a href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <Logo />
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-ink-900 sm:text-base">
                {site.shortName}
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-400">
                Tools &amp; Electronics
              </span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-700"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden items-center gap-2 sm:inline-flex">
                {user.isAdmin ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-600/30 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
                  >
                    <GearIcon className="size-3.5" />
                    Manage products
                  </Link>
                ) : null}
                <a
                  href="/auth"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-800 hover:border-brand-600 hover:text-brand-700"
                >
                  <span className="size-2 rounded-full bg-brand-600" />
                  {displayName}
                </a>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full px-2.5 py-1.5 text-xs font-medium text-ink-500 hover:text-ink-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <a
                href="/auth"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 sm:inline-flex"
              >
                Sign in
              </a>
            )}

            <a href={`tel:${primaryPhone.tel}`} className={`${buttonStyles.primary} hidden sm:inline-flex`}>
              <PhoneIcon className="size-4" />
              Call {primaryPhone.label}
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center rounded-xl border border-ink-200 bg-white text-ink-700 lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? (
                  <path d="m6 6 12 12M18 6 6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </Container>
      </div>

      {/* Mobile menu — animated slide-down */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-b border-ink-200 bg-paper transition-all duration-300 ease-in-out lg:hidden ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <Container className="flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base font-medium text-ink-700 hover:bg-ink-100"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-3 grid gap-2">
            {user?.isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-600/30 bg-brand-50 px-3 py-3 text-sm font-bold text-brand-700"
              >
                <GearIcon className="size-4" />
                Manage products
              </Link>
            ) : null}
            {user ? (
              <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3">
                <a
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-ink-800"
                >
                  👤 {displayName} (Account)
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="text-xs font-semibold text-red-600"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <a href="/auth" onClick={() => setOpen(false)} className={buttonStyles.outline}>
                Sign in or create account
              </a>
            )}
            {site.phones.map((phone) => (
              <a key={phone.tel} href={`tel:${phone.tel}`} className={buttonStyles.primary}>
                <PhoneIcon className="size-4" />
                Call {phone.label}
              </a>
            ))}
          </div>
        </Container>
      </div>
    </header>
  );
}
