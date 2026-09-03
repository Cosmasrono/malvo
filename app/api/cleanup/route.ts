import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cleanup
 *
 * Deletes expired sessions and email verification records.
 * Call this from a cron job / Vercel Cron / external scheduler.
 *
 * Protect the route with a secret token so it can't be triggered freely:
 *   CRON_SECRET=some-random-string  (in .env)
 * Then call:
 *   GET /api/cleanup  with header  Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  const [sessions, verifications] = await Promise.all([
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.emailVerification.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);

  return NextResponse.json({
    deleted: {
      sessions: sessions.count,
      verifications: verifications.count,
    },
    at: now.toISOString(),
  });
}
