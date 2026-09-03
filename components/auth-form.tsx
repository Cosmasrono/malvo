"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui";
import { whatsappLink, site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

type Mode = "signin" | "signup";

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  emailVerified: string | null;
}

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form fields
  const [identifier, setIdentifier] = useState(""); // email or username
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // States
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Check if currently logged in
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.username) {
            setUsername(data.user.username);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  async function submit(action: string, values: Record<string, string>) {
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...values }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Authentication failed.",
      );
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "signup") {
      const result = await submit("signup", {
        email: identifier,
        password,
        username,
      });
      if (result?.status === "verification-required") {
        setTargetEmail(identifier);
        setVerificationRequired(true);
        setMessage("We sent a 6-digit verification code to your email.");
      }
    } else {
      // Sign in
      const result = await submit("signin", {
        identifier,
        password,
        username, // optionally inserts username if user didn't have one
      });
      if (result?.status === "verification-required") {
        setTargetEmail(result.email || identifier);
        setVerificationRequired(true);
        setMessage("Your email is not yet verified. A 6-digit code was sent.");
      } else if (result?.status === "authenticated") {
        router.push("/");
        router.refresh();
      }
    }
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await submit("verify", {
      email: targetEmail,
      code,
      username,
    });
    if (result?.status === "authenticated") {
      router.push("/");
      router.refresh();
    }
  }

  async function handleUpdateUsername(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update username");
      setCurrentUser(data.user);
      setMessage("Username updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    setSubmitting(true);
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signout" }),
    });
    setCurrentUser(null);
    setSubmitting(false);
    router.refresh();
  }

  // Already logged in state
  if (!loadingUser && currentUser) {
    return (
      <div className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between border-b border-ink-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Account Signed In
            </p>
            <h2 className="mt-1 text-xl font-bold text-ink-900">
              {currentUser.username ? `@${currentUser.username}` : currentUser.email}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={submitting}
            className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50"
          >
            Sign out
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink-600">
            Email: <strong className="text-ink-900">{currentUser.email}</strong>
          </p>

          <form onSubmit={handleUpdateUsername} className="mt-4 space-y-3">
            <label className="block text-sm font-semibold text-ink-700">
              {currentUser.username ? "Change your username" : "Insert your username"}
              <input
                type="text"
                required
                minLength={2}
                maxLength={30}
                placeholder="e.g. JohnMwanza or FundiRama"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-900 outline-none focus:border-brand-600"
              />
            </label>
            {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
            {message ? <p className="text-sm font-medium text-brand-700">{message}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className={`${buttonStyles.primary} w-full`}
            >
              {submitting ? "Saving…" : "Save Username"}
            </button>
          </form>
        </div>

        {/* WhatsApp direct order reminder */}
        <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-4 text-xs text-brand-900">
          <p className="font-semibold">⚡ Want to order equipment?</p>
          <p className="mt-1 text-ink-600">
            You can order directly anytime on WhatsApp without waiting.
          </p>
          <a
            href={whatsappLink(`Hello ${site.shortName}, I am logged in as ${currentUser.username || currentUser.email} and would like to place an order.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-800"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" />
            Order directly on WhatsApp →
          </a>
        </div>
      </div>
    );
  }

  // Verification step
  if (verificationRequired) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 shadow-card sm:p-8">
        <p className="eyebrow">Check your inbox</p>
        <h2 className="mt-3 text-2xl font-bold text-ink-900">Verify your email</h2>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          Enter the 6-digit code sent to <strong>{targetEmail}</strong>. It expires in 15 minutes.
        </p>
        <form onSubmit={verifyEmail} className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-ink-700">
            Verification code
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-2 block w-full rounded-xl border border-ink-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-ink-900 outline-none focus:border-brand-600"
            />
          </label>
          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
          {message ? <p className="text-sm font-medium text-brand-700">{message}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className={`${buttonStyles.primary} w-full disabled:opacity-60`}
          >
            {submitting ? "Checking…" : "Verify email"}
          </button>
          <button
            type="button"
            onClick={() => setVerificationRequired(false)}
            className="w-full text-sm font-semibold text-ink-500 hover:text-ink-900"
          >
            Use a different email
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-card sm:p-8">
      {/* Direct WhatsApp Ordering Notice */}
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <WhatsAppIcon className="mt-0.5 size-5 shrink-0 text-[#25D366]" />
          <div>
            <p className="text-sm font-bold text-ink-900">
              Ordering equipment? Login is NOT required!
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-600">
              You do not need an account to buy or enquire. You can order directly via WhatsApp right now.
            </p>
            <a
              href={whatsappLink(`Hello ${site.shortName}, I would like to make an enquiry or place an order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Order on WhatsApp instead →
            </a>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-ink-100 pb-4">
        {(["signup", "signin"] as Mode[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setError("");
              setMessage("");
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              mode === option
                ? "bg-ink-900 text-white"
                : "text-ink-500 hover:bg-ink-50"
            }`}
          >
            {option === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Username field */}
        {mode === "signup" ? (
          <label className="block text-sm font-semibold text-ink-700">
            Username / Your Name
            <span className="ml-1 text-xs font-normal text-ink-400">(optional)</span>
            <input
              type="text"
              placeholder="e.g. fundi_ali or Baraka"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-ink-200 px-4 py-3 font-normal text-ink-900 outline-none focus:border-brand-600"
            />
          </label>
        ) : null}

        {/* Email or Username identifier */}
        <label className="block text-sm font-semibold text-ink-700">
          {mode === "signup" ? "Email address" : "Email address or Username"}
          <input
            type={mode === "signup" ? "email" : "text"}
            required
            autoComplete={mode === "signup" ? "email" : "username"}
            placeholder={mode === "signup" ? "name@example.com" : "Email or username"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-ink-200 px-4 py-3 font-normal text-ink-900 outline-none focus:border-brand-600"
          />
        </label>

        {/* Password */}
        <label className="block text-sm font-semibold text-ink-700">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-ink-200 px-4 py-3 font-normal text-ink-900 outline-none focus:border-brand-600"
          />
        </label>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {message ? <p className="text-sm font-medium text-brand-700">{message}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className={`${buttonStyles.primary} w-full disabled:cursor-wait disabled:opacity-60`}
        >
          {submitting
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>
    </div>
  );
}
