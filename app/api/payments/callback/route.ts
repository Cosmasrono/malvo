import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readOutcome } from "@/lib/payhero";

/**
 * POST /api/payments/callback — PayHero posts the outcome of an STK push here.
 *
 * The endpoint is unauthenticated because PayHero does not sign its callbacks,
 * so it is written to be safe when called by anyone: it never trusts an amount
 * from the body, only ever moves an order out of PENDING, and matches on a
 * reference that is not guessable in bulk.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const inner =
      body.response && typeof body.response === "object"
        ? (body.response as Record<string, unknown>)
        : body;

    const referenceValue =
      inner.ExternalReference ??
      inner.external_reference ??
      body.ExternalReference ??
      body.external_reference;
    const reference = typeof referenceValue === "string" ? referenceValue : null;

    if (!reference) {
      console.error("PayHero callback had no external reference", body);
      return NextResponse.json({ status: "ignored" });
    }

    const order = await prisma.order.findUnique({ where: { reference } });
    if (!order) {
      console.error("PayHero callback for unknown order", reference);
      return NextResponse.json({ status: "ignored" });
    }

    // Already settled — a repeated callback must not undo a paid order.
    if (order.status !== "PENDING") {
      return NextResponse.json({ status: "already-settled" });
    }

    const outcome = readOutcome(body);
    if (outcome.status === "PENDING") {
      return NextResponse.json({ status: "pending" });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: outcome.status,
        mpesaReceipt: outcome.receipt ?? null,
        failureReason: outcome.status === "FAILED" ? (outcome.reason ?? "Payment failed") : null,
      },
    });

    return NextResponse.json({ status: "recorded" });
  } catch (error) {
    console.error("PayHero callback failed", error);
    // Answer 200 regardless so PayHero does not retry against a broken parse.
    return NextResponse.json({ status: "error" });
  }
}
