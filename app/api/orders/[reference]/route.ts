import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkTransactionStatus } from "@/lib/payhero";

/**
 * GET /api/orders/:reference — how a payment is going, polled by the checkout
 * page while the customer is entering their M-Pesa PIN.
 *
 * The reference is the only credential, which is why the response carries no
 * personal details beyond what the buyer just typed in themselves.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;

  try {
    let order = await prisma.order.findUnique({ where: { reference } });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // The callback cannot reach a machine running on localhost, and can lag in
    // production, so ask PayHero directly while we are still waiting.
    if (order.status === "PENDING") {
      const outcome = await checkTransactionStatus(reference, order.providerRef);
      if (outcome.status !== "PENDING") {
        order = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: outcome.status,
            mpesaReceipt: outcome.receipt ?? null,
            failureReason:
              outcome.status === "FAILED" ? (outcome.reason ?? "Payment failed") : null,
          },
        });
      }
    }

    return NextResponse.json({
      reference: order.reference,
      status: order.status,
      total: order.total,
      mpesaReceipt: order.mpesaReceipt,
      failureReason: order.failureReason,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
  } catch (error) {
    console.error("Order lookup failed", error);
    return NextResponse.json({ error: "Could not check that order." }, { status: 500 });
  }
}
