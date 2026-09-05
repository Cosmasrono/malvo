import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const VERIFICATION_MINUTES = 15;
const SESSION_DAYS = 30;
const MAX_VERIFY_ATTEMPTS = 5;

/** Proper email regex — rejects bare "@", missing domain, etc. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------------------------------------------------------------------------
// In-process rate limiter
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  if (entry.count > maxRequests) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeCompareHash(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function sessionCookie(response: NextResponse, token: string) {
  response.cookies.set("malvo_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set("malvo_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

async function issueVerificationCode(userId: string, email: string) {
  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + VERIFICATION_MINUTES * 60 * 1000);
  await prisma.emailVerification.upsert({
    where: { userId },
    update: { codeHash: digest(code), expiresAt, attempts: 0 },
    create: { userId, codeHash: digest(code), expiresAt },
  });
  await sendVerificationCode(email, code);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(`auth:${ip}`, 15, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const action = String(body.action ?? "");

    // -----------------------------------------------------------------------
    // SIGN OUT
    // -----------------------------------------------------------------------
    if (action === "signout") {
      const cookieHeader = request.headers.get("cookie") ?? "";
      const match = cookieHeader.match(/malvo_session=([^;]+)/);
      const token = match ? match[1] : null;

      if (token) {
        await prisma.session
          .deleteMany({ where: { tokenHash: digest(token) } })
          .catch(() => {});
      }

      const response = NextResponse.json({ status: "signed-out" });
      clearSessionCookie(response);
      return response;
    }

    const rawIdentifier = String(body.email ?? body.identifier ?? "").trim();
    const password = String(body.password ?? "");
    const username = body.username ? String(body.username).trim() : undefined;

    // -----------------------------------------------------------------------
    // SIGN UP
    // -----------------------------------------------------------------------
    if (action === "signup") {
      const email = rawIdentifier.toLowerCase();
      if (!email || !EMAIL_RE.test(email)) {
        return NextResponse.json(
          { error: "Enter a valid email address." },
          { status: 400 },
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters." },
          { status: 400 },
        );
      }

      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing?.emailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }

      const passwordHash = await hash(password, 12);

      const user = existing
        ? await prisma.user.update({
            where: { id: existing.id },
            data: {
              passwordHash,
              ...(username ? { username } : {}),
            },
          })
        : await prisma.user.create({
            data: {
              email,
              passwordHash,
              username: username || null,
            },
          });

      await issueVerificationCode(user.id, email);
      return NextResponse.json({ status: "verification-required" });
    }

    // -----------------------------------------------------------------------
    // VERIFY EMAIL
    // -----------------------------------------------------------------------
    if (action === "verify") {
      const email = rawIdentifier.toLowerCase();
      const code = String(body.code ?? "");

      const verification = await prisma.emailVerification.findFirst({
        where: { user: { email } },
      });

      const isExpired = verification && verification.expiresAt < new Date();
      const isMaxAttempts =
        verification && verification.attempts >= MAX_VERIFY_ATTEMPTS;
      const isWrongCode =
        !verification || !safeCompareHash(verification.codeHash, digest(code));

      if (!verification || isExpired || isMaxAttempts || isWrongCode) {
        if (verification && !isExpired && !isMaxAttempts) {
          await prisma.emailVerification.update({
            where: { id: verification.id },
            data: { attempts: { increment: 1 } },
          });
        }
        return NextResponse.json(
          { error: "That code is invalid or expired." },
          { status: 400 },
        );
      }

      // If user also provided a username during verification, save it
      const user = await prisma.user.update({
        where: { id: verification.userId },
        data: {
          emailVerified: new Date(),
          ...(username ? { username } : {}),
          verification: { delete: true },
        },
      });

      const token = randomBytes(32).toString("hex");
      await prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: digest(token),
          expiresAt: new Date(
            Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
      });

      const response = NextResponse.json({
        status: "authenticated",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      });
      sessionCookie(response, token);
      return response;
    }

    // -----------------------------------------------------------------------
    // SIGN IN
    // -----------------------------------------------------------------------
    if (action === "signin") {
      if (!rawIdentifier) {
        return NextResponse.json(
          { error: "Please enter your email or username." },
          { status: 400 },
        );
      }

      // Allow login with either email address or username
      let user = null;
      if (rawIdentifier.includes("@")) {
        user = await prisma.user.findUnique({
          where: { email: rawIdentifier.toLowerCase() },
        });
      } else {
        user = await prisma.user.findFirst({
          where: {
            username: {
              equals: rawIdentifier,
              mode: "insensitive",
            },
          },
        });
      }

      const passwordMatch =
        user && (await compare(password, user.passwordHash));

      if (!user || !passwordMatch) {
        return NextResponse.json(
          { error: "Invalid login credentials. Check your email/username and password." },
          { status: 401 },
        );
      }

      if (!user.emailVerified) {
        await issueVerificationCode(user.id, user.email);
        return NextResponse.json({ status: "verification-required", email: user.email });
      }

      // If user provided a username during sign in and doesn't have one set yet, insert it!
      if (username && !user.username) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
      }

      const token = randomBytes(32).toString("hex");
      await prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: digest(token),
          expiresAt: new Date(
            Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
      });

      const response = NextResponse.json({
        status: "authenticated",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      });
      sessionCookie(response, token);
      return response;
    }

    return NextResponse.json(
      { error: "Unsupported authentication action." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Authentication error", error);
    if (
      error instanceof Error &&
      (error.message.includes("SMTP configuration is missing") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("Invalid login"))
    ) {
      return NextResponse.json(
        {
          error:
            "Email delivery is not configured. Update the SMTP settings in your .env file.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Authentication is temporarily unavailable." },
      { status: 500 },
    );
  }
}