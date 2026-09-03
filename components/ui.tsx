import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const alignment = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";
  return (
    <div className={alignment}>
      <p className={tone === "dark" ? "eyebrow !text-brand-300" : "eyebrow"}>{eyebrow}</p>
      <h2
        className={`mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl ${
          tone === "dark" ? "text-white" : "text-ink-900"
        }`}
      >
        {title}
      </h2>
      {intro ? (
        <p className={`mt-4 text-pretty text-base leading-7 ${tone === "dark" ? "text-ink-300" : "text-ink-500"}`}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200";

export const buttonStyles = {
  primary: `${buttonBase} bg-brand-600 text-white hover:bg-brand-700`,
  dark: `${buttonBase} bg-ink-900 text-white hover:bg-ink-700`,
  outline: `${buttonBase} border border-ink-200 bg-white text-ink-700 hover:border-brand-600 hover:text-brand-700`,
  ghostOnDark: `${buttonBase} border border-white/20 bg-white/5 text-white hover:bg-white/10`,
};

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-base font-bold text-white ${className}`}
      aria-hidden="true"
    >
      M
    </span>
  );
}
