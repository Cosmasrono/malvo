"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonStyles } from "@/components/ui";
import { CartIcon, CheckIcon, WhatsAppIcon } from "@/components/icons";
import { useCart } from "@/lib/cart";
import { formatKsh } from "@/lib/money";
import { site, whatsappLink } from "@/lib/site";

type Stage = "cart" | "waiting" | "paid" | "failed" | "cash-placed";

type OrderStatus = {
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  mpesaReceipt?: string | null;
  failureReason?: string | null;
  total: number;
};

const fieldStyles =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100";
const labelStyles = "block text-xs font-semibold uppercase tracking-wider text-ink-500";

/** Give up polling after this long and tell the customer what to do next. */
const POLL_TIMEOUT_MS = 2 * 60 * 1000;
const POLL_INTERVAL_MS = 4000;

export function CheckoutClient({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const { lines, total, count, ready, setQuantity, remove, clear } = useCart();

  const [stage, setStage] = useState<Stage>("cart");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "cash">(
    paymentsEnabled ? "mpesa" : "cash",
  );

  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState("");
  const [paidTotal, setPaidTotal] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cleared by the poller when it stops, so an unmount cannot leave it running.
  const pollTimer = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current !== null) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  /** Watches the order until M-Pesa settles it, one way or the other. */
  const watchOrder = useCallback(
    (orderReference: string) => {
      const startedAt = Date.now();

      pollTimer.current = window.setInterval(async () => {
        try {
          const response = await fetch(`/api/orders/${orderReference}`, { cache: "no-store" });
          if (!response.ok) return;

          const order = (await response.json()) as OrderStatus;

          if (order.status === "PAID") {
            stopPolling();
            setReceipt(order.mpesaReceipt ?? "");
            setPaidTotal(order.total);
            setStage("paid");
            clear();
            return;
          }

          if (order.status === "FAILED" || order.status === "CANCELLED") {
            stopPolling();
            setError(order.failureReason || "The payment did not go through.");
            setStage("failed");
            return;
          }

          if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
            stopPolling();
            setError(
              "We have not seen the payment yet. If your M-Pesa message says it went through, send us the code on WhatsApp and we will confirm.",
            );
            setStage("failed");
          }
        } catch {
          // A dropped request is fine — the next tick tries again.
        }
      }, POLL_INTERVAL_MS);
    },
    [clear, stopPolling],
  );

  /** The whole order written out, ready to send to the shop on WhatsApp. */
  function orderMessage(orderReference: string) {
    const settle = deliveryMethod === "delivery" ? "delivery" : "collection";

    return [
      `Hello ${site.shortName}, I would like to place this order:`,
      "",
      `Reference: ${orderReference}`,
      ...lines.map(
        (line) =>
          `• ${line.quantity} × ${line.name} — ${formatKsh(line.unitPrice * line.quantity)}`,
      ),
      `Total: ${formatKsh(total)}`,
      `Paying: cash on ${settle}`,
      `Name: ${customerName}`,
      `Phone: ${phone}`,
      ...(notes ? [`Notes: ${notes}`] : []),
    ].join("\n");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          notes,
          deliveryMethod,
          paymentMethod,
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not start the payment.");
        return;
      }

      setReference(data.reference);

      if (paymentMethod === "cash") {
        // Hand off to WhatsApp. Pop-up blockers can stop this, so the next
        // screen always shows the same link as a button.
        window.open(whatsappLink(orderMessage(data.reference)), "_blank", "noopener");
        setStage("cash-placed");
        clear();
        return;
      }

      setStage("waiting");
      watchOrder(data.reference);
    } catch {
      setError("Network problem — the payment was not started.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------
  // Payment succeeded
  // ---------------------------------------------------------------------
  if (stage === "paid") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-600 text-white">
          <CheckIcon className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">Payment received</h2>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          Thank you. We have your {formatKsh(paidTotal)} payment for order{" "}
          <strong className="text-ink-900">{reference}</strong>
          {receipt ? (
            <>
              {" "}
              — M-Pesa code <strong className="text-ink-900">{receipt}</strong>
            </>
          ) : null}
          . We will call you on {phone} to arrange{" "}
          {deliveryMethod === "delivery" ? "delivery" : "collection"}.
        </p>

        <a
          href={whatsappLink(
            `Hello ${site.shortName}, I have just paid for order ${reference}${receipt ? ` (M-Pesa ${receipt})` : ""}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white"
        >
          <WhatsAppIcon className="size-4" />
          Send us the details on WhatsApp
        </a>

        <div className="mt-6">
          <Link href="/#products" className="text-sm font-semibold text-brand-700 hover:underline">
            ← Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Cash order placed — the conversation moves to WhatsApp
  // ---------------------------------------------------------------------
  if (stage === "cash-placed") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#25D366] text-white">
          <WhatsAppIcon className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">Order reserved</h2>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          Order <strong className="text-ink-900">{reference}</strong> is held for you,
          to be paid in cash on{" "}
          {deliveryMethod === "delivery" ? "delivery" : "collection"}. Send it to us on
          WhatsApp and we will confirm availability and timing.
        </p>

        <a
          href={whatsappLink(orderMessage(reference))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#20ba5a]"
        >
          <WhatsAppIcon className="size-4" />
          Open WhatsApp with my order
        </a>
        <p className="mt-3 text-xs text-ink-400">
          If WhatsApp did not open by itself, tap the button above.
        </p>

        <div className="mt-6">
          <Link href="/#products" className="text-sm font-semibold text-brand-700 hover:underline">
            ← Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Waiting for the customer to enter their PIN
  // ---------------------------------------------------------------------
  if (stage === "waiting") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-card">
        <span className="mx-auto block size-12 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">
          Check your phone
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          We have sent an M-Pesa request for <strong>{formatKsh(total)}</strong> to{" "}
          <strong>{phone}</strong>. Enter your M-Pesa PIN to complete order{" "}
          <strong className="text-ink-900">{reference}</strong>.
        </p>
        <p className="mt-4 text-xs text-ink-400">
          Keep this page open — it updates by itself once the payment goes through.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Payment failed or timed out
  // ---------------------------------------------------------------------
  if (stage === "failed") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Payment not completed</h2>
        <p className="mt-3 text-sm leading-6 text-ink-600">{error}</p>
        <p className="mt-2 text-xs text-ink-500">
          Order reference <strong>{reference}</strong>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStage("cart");
              setError("");
            }}
            className={buttonStyles.primary}
          >
            Try again
          </button>
          <a
            href={whatsappLink(
              `Hello ${site.shortName}, I had trouble paying for order ${reference}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles.outline}
          >
            Get help on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Cart + details
  // ---------------------------------------------------------------------
  if (!ready) {
    return <div className="h-40 animate-pulse rounded-2xl border border-ink-200 bg-white" />;
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-ink-100 text-ink-400">
          <CartIcon className="size-7" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-ink-900">Your cart is empty</h2>
        <p className="mt-2 text-sm text-ink-500">
          Add machines from the catalogue, or ask us for a price on WhatsApp.
        </p>
        <Link href="/#products" className={`${buttonStyles.primary} mt-6`}>
          Browse the catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      {/* Cart lines */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
        <ul className="divide-y divide-ink-100">
          {lines.map((line) => (
            <li key={line.productId} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
                {line.image ? (
                  <Image src={line.image} alt="" fill sizes="64px" className="object-cover" unoptimized />
                ) : null}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">{line.name}</p>
                <p className="mt-1 text-sm text-ink-500">{formatKsh(line.unitPrice)} each</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor={`qty-${line.productId}`}>
                  Quantity of {line.name}
                </label>
                <input
                  id={`qty-${line.productId}`}
                  type="number"
                  min={1}
                  max={99}
                  value={line.quantity}
                  onChange={(event) => setQuantity(line.productId, Number(event.target.value))}
                  className="w-16 rounded-xl border border-ink-200 px-3 py-2 text-center text-sm"
                />
                <span className="w-28 text-right font-semibold text-ink-900">
                  {formatKsh(line.unitPrice * line.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(line.productId)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/60 px-5 py-4">
          <span className="text-sm font-semibold text-ink-600">Total</span>
          <span className="text-xl font-bold tracking-tight text-ink-900">{formatKsh(total)}</span>
        </div>
      </div>

      {/* Details + pay */}
      <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold tracking-tight text-ink-900">Your details</h2>

        <div>
          <label className={labelStyles} htmlFor="checkout-name">Full name</label>
          <input
            id="checkout-name"
            className={`${fieldStyles} mt-2`}
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            required
            minLength={2}
          />
        </div>

        <fieldset>
          <legend className={labelStyles}>How would you like to pay?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {[
              {
                value: "mpesa" as const,
                label: "M-Pesa now",
                hint: "Get a PIN prompt on your phone",
                disabled: !paymentsEnabled,
              },
              {
                value: "cash" as const,
                label: "Cash",
                hint: "Pay in person, arrange on WhatsApp",
                disabled: false,
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`rounded-xl border px-4 py-3 text-center transition ${
                  option.disabled
                    ? "cursor-not-allowed border-ink-200 opacity-50"
                    : paymentMethod === option.value
                      ? "cursor-pointer border-brand-600 bg-brand-50"
                      : "cursor-pointer border-ink-200 hover:border-ink-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  disabled={option.disabled}
                  onChange={() => setPaymentMethod(option.value)}
                  className="sr-only"
                />
                <span
                  className={`block text-sm font-semibold ${
                    paymentMethod === option.value ? "text-brand-700" : "text-ink-700"
                  }`}
                >
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-ink-500">{option.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className={labelStyles} htmlFor="checkout-phone">
            {paymentMethod === "cash" ? "Phone number" : "M-Pesa number"}
          </label>
          <input
            id="checkout-phone"
            type="tel"
            inputMode="tel"
            className={`${fieldStyles} mt-2`}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0712 345 678"
            required
          />
          <p className="mt-1.5 text-xs text-ink-400">
            {paymentMethod === "cash"
              ? "So we can reach you about your order."
              : "The PIN prompt is sent to this number."}
          </p>
        </div>

        <div>
          <label className={labelStyles} htmlFor="checkout-email">Email (optional)</label>
          <input
            id="checkout-email"
            type="email"
            className={`${fieldStyles} mt-2`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <fieldset>
          <legend className={labelStyles}>How will you receive it?</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {[
              { value: "pickup", label: "Collect in shop" },
              { value: "delivery", label: "Deliver to me" },
            ].map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
                  deliveryMethod === option.value
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-ink-200 text-ink-600 hover:border-ink-300"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={option.value}
                  checked={deliveryMethod === option.value}
                  onChange={(event) => setDeliveryMethod(event.target.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className={labelStyles} htmlFor="checkout-notes">Notes (optional)</label>
          <textarea
            id="checkout-notes"
            rows={3}
            className={`${fieldStyles} mt-2 resize-y`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Delivery area, landmark, or anything we should know."
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        {!paymentsEnabled ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            M-Pesa checkout is not switched on yet, so orders are placed as cash and
            agreed on WhatsApp.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className={`${
            paymentMethod === "cash"
              ? "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#20ba5a]"
              : buttonStyles.primary
          } w-full`}
        >
          {paymentMethod === "cash" ? (
            <>
              <WhatsAppIcon className="size-4" />
              {submitting ? "Placing order…" : `Order ${formatKsh(total)} — pay cash`}
            </>
          ) : submitting ? (
            "Sending M-Pesa request…"
          ) : (
            `Pay ${formatKsh(total)} with M-Pesa`
          )}
        </button>

        <p className="text-center text-xs text-ink-400">
          {paymentMethod === "cash"
            ? "We will open WhatsApp with your order so we can confirm stock and timing. Nothing is charged now."
            : "You will get an M-Pesa prompt on your phone. Nothing is charged until you enter your PIN."}
        </p>
      </form>
    </div>
  );
}
