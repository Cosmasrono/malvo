import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/me
 * Retrieves the currently authenticated user based on session cookie.
 */
export async function GET() {
  const user = await getSessionUser();

  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      isAdmin: user.isAdmin,
    },
  });
}
