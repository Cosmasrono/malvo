import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKsh } from "@/lib/money";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-ink-100 text-ink-500 border-ink-200",
};

export default async function OrdersPage() {
  if (!(await getAdminUser())) redirect("/admin");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const paidTotal = orders
    .filter((order) => order.status === "PAID")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 py-12 sm:py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Maggy City admin</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Orders
              </h1>
              <p className="mt-3 text-base leading-7 text-ink-500">
                Every M-Pesa checkout, newest first. {formatKsh(paidTotal)} collected across{" "}
                {orders.filter((order) => order.status === "PAID").length} paid orders.
              </p>
            </div>
            <Link href="/admin" className="text-sm font-semibold text-brand-700 hover:underline">
              ← Product manager
            </Link>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
            {orders.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-base font-semibold text-ink-900">No orders yet</p>
                <p className="mt-2 text-sm text-ink-500">
                  Orders appear here as soon as a customer pays at checkout.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {orders.map((order) => (
                  <li key={order.id} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-ink-900">{order.reference}</p>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              statusStyles[order.status] ?? statusStyles.CANCELLED
                            }`}
                          >
                            {order.status === "PENDING" && order.paymentMethod === "cash"
                              ? "Awaiting cash"
                              : order.status}
                          </span>
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                            {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              order.paymentMethod === "cash"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-brand-50 text-brand-700"
                            }`}
                          >
                            {order.paymentMethod === "cash" ? "Cash" : "M-Pesa"}
                          </span>
                        </div>

                        <p className="mt-1.5 text-sm text-ink-700">
                          {order.customerName} ·{" "}
                          <a href={`tel:${order.phone}`} className="hover:underline">
                            {order.phone}
                          </a>
                          {order.email ? ` · ${order.email}` : null}
                        </p>

                        <ul className="mt-2 text-sm text-ink-500">
                          {order.items.map((item, index) => (
                            <li key={`${order.id}-${index}`}>
                              {item.quantity} × {item.name} — {formatKsh(item.unitPrice * item.quantity)}
                            </li>
                          ))}
                        </ul>

                        {order.notes ? (
                          <p className="mt-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
                            {order.notes}
                          </p>
                        ) : null}

                        {order.failureReason ? (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {order.failureReason}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold tracking-tight text-ink-900">
                          {formatKsh(order.total)}
                        </p>
                        {order.mpesaReceipt ? (
                          <p className="mt-1 text-xs font-semibold text-emerald-700">
                            {order.mpesaReceipt}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-ink-400">
                          {order.createdAt.toLocaleString("en-KE", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
