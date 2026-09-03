import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * GET /api/me
 * Retrieves the currently authenticated user based on session cookie.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("malvo_session")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const tokenHash = digest(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

/**
 * PATCH /api/me
 * Allows authenticated user to insert or update their username.
 */
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("malvo_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokenHash = digest(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const body = await request.json();
    const username = String(body.username ?? "").trim();

    if (!username || username.length < 2 || username.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 2 and 30 characters." },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Error updating username in /api/me:", error);
    return NextResponse.json(
      { error: "Failed to update username." },
      { status: 500 },
    );
  }
}
