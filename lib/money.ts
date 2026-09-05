/**
 * Money formatting, kept free of "use client" so both server and client
 * components can call it.
 */

/** Whole shillings, grouped — e.g. "KSh 45,000". */
export function formatKsh(amount: number): string {
  return `KSh ${new Intl.NumberFormat("en-KE").format(Math.round(amount))}`;
}
