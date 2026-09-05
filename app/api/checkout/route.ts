import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { initiateStkPush, normalisePhone, payheroConfigured } from "@/lib/payhero";

/** Rebuilt server-side from the catalogue — never trust a price from the browser. */
type SubmittedLine = { productId: string; quantity: number };

/** Human-readable and unique enough to quote over the phone: MC-4F2K7Q. */
function newReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix += alphabet[randomInt(alphabet.length)];
  }
  return `MC-${suffix}`;
}

/** Where PayHero should post the result. Falls back to the request's own origin. */
function callbackUrl(request: Request): string {
  const configured = process.env.PAYHERO_CALLBACK_URL?.trim();
  if (configured) return configured;

  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
  return `${base.replace(/\/$/, "")}/api/payments/callback`;
}

/**
 * POST /api/checkout
 *
 * Records the order either way, then branches on `paymentMethod`:
 * "mpesa" sends an STK prompt to the customer's phone, "cash" simply reserves
 * the order so it can be settled in person after a WhatsApp conversation.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const paymentMethod = body.paymentMethod === "cash" ? "cash" : "mpesa";

    if (paymentMethod === "mpesa" && !payheroConfigured()) {
      return NextResponse.json(
        { error: "M-Pesa payment is not set up yet. Please choose cash instead." },
        { status: 503 },
      );
    }

    const customerName = String(body.customerName ?? "").trim();
    if (customerName.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    const phone = normalisePhone(String(body.phone ?? ""));
    if (!phone) {
      return NextResponse.json(
        {
          error:
            paymentMethod === "cash"
              ? "Enter a valid Kenyan phone number, e.g. 0712 345 678."
              : "Enter a valid Kenyan M-Pesa number, e.g. 0712 345 678.",
        },
        { status: 400 },
      );
    }

    const submitted = Array.isArray(body.items) ? (body.items as SubmittedLine[]) : [];
    if (submitted.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Look the products up again so the amount charged comes from our own
    // catalogue, whatever the browser claimed the prices were.
    const products = await prisma.product.findMany({
      where: { id: { in: submitted.map((line) => String(line.productId)) }, published: true },
    });

    const items = submitted.flatMap((line) => {
      const product = products.find((candidate) => candidate.id === line.productId);
      if (!product || product.price === null) return [];

      const quantity = Math.min(Math.max(Math.trunc(Number(line.quantity) || 0), 1), 99);
      return [
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity,
        },
      ];
    });

    if (items.length !== submitted.length) {
      return NextResponse.json(
        { error: "Some items are no longer available. Please review your cart." },
        { status: 409 },
      );
    }

    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (total < 1) {
      return NextResponse.json({ error: "That order totals nothing to pay." }, { status: 400 });
    }

    const reference = newReference();
    const order = await prisma.order.create({
      data: {
        reference,
        customerName,
        phone,
        email: body.email ? String(body.email).trim().slice(0, 200) : null,
        notes: body.notes ? String(body.notes).trim().slice(0, 500) : null,
        deliveryMethod: body.deliveryMethod === "delivery" ? "delivery" : "pickup",
        paymentMethod,
        items,
        total,
      },
    });

    // Cash is settled in person, so we just record the order and hand the
    // customer off to WhatsApp to agree collection or delivery.
    if (paymentMethod === "cash") {
      return NextResponse.json({ reference, total, paymentMethod }, { status: 201 });
    }

    const push = await initiateStkPush({
      amount: total,
      phone,
      reference,
      customerName,
      callbackUrl: callbackUrl(request),
    });

    if (!push.ok) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED", failureReason: push.error ?? "STK push rejected" },
      });
      return NextResponse.json({ error: push.error }, { status: 502 });
    }

    if (push.providerRef) {
      await prisma.order.update({
        where: { id: order.id },
        data: { providerRef: push.providerRef },
      });
    }

    return NextResponse.json({ reference, total, paymentMethod }, { status: 201 });
  } catch (error) {
    console.error("Checkout failed", error);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again." },
      { status: 500 },
    );
  }
}
