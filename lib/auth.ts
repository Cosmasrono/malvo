/**
 * Shared session helpers.
 *
 * The session cookie holds a random token; only its SHA-256 digest is stored,
 * so a database leak cannot be replayed as a login.
 */
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "malvo_session";

export function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Bootstrap list of owner accounts. Anyone signing in with one of these
 * addresses is treated as an admin even if their stored role says otherwise,
 * which is how the very first admin gets in without database surgery.
 */
export function bootstrapAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export type SessionUser = {
  id: string;
  email: string;
  username: string | null;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
  isAdmin: boolean;
};

/** Resolves the signed-in user, or null. Never throws. */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { tokenHash: digest(token) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) return null;

    const { user } = session;
    return {
      ...user,
      isAdmin:
        user.role === "ADMIN" ||
        bootstrapAdminEmails().includes(user.email.toLowerCase()),
    };
  } catch (error) {
    console.error("Session lookup failed", error);
    return null;
  }
}

/** Returns the user only when they are an admin, otherwise null. */
export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user?.isAdmin ? user : null;
}
