/**
 * PayHero M-Pesa STK push client.
 *
 * Docs: https://docs.payhero.co.ke — the dashboard shows a ready-made Basic
 * token, but it is only base64("username:password"), so either form works.
 *
 * Credentials never leave the server: this module is imported by route
 * handlers only.
 */

const DEFAULT_API_BASE = "https://backend.payhero.co.ke/api/v2";

function apiBase(): string {
  const configured = process.env.PAYHERO_BASE_URL?.trim().replace(/\/$/, "");
  return configured || DEFAULT_API_BASE;
}

export type StkPushResult = {
  ok: boolean;
  /** PayHero's own reference for the push, stored for reconciliation. */
  providerRef?: string;
  error?: string;
};

export type TransactionStatus = "PENDING" | "PAID" | "FAILED";

/** Builds the Authorization header, preferring a pasted token over a pair. */
function basicToken(): string | null {
  const token = process.env.PAYHERO_BASIC_AUTH_TOKEN?.trim();
  if (token) return token;

  const username = process.env.PAYHERO_API_USERNAME?.trim();
  const password = process.env.PAYHERO_API_PASSWORD?.trim();
  if (!username || !password) return null;

  return Buffer.from(`${username}:${password}`).toString("base64");
}

/** True when the environment is configured well enough to take payments. */
export function payheroConfigured(): boolean {
  return Boolean(basicToken() && process.env.PAYHERO_CHANNEL_ID);
}

/**
 * Normalises the many ways Kenyans write a number (0713…, 254713…, +254 713…,
 * 713…) into the 07xxxxxxxx form PayHero expects.
 * Returns null when it is not a plausible Kenyan mobile number.
 */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  let local: string;
  if (digits.startsWith("254")) local = `0${digits.slice(3)}`;
  else if (digits.startsWith("0")) local = digits;
  else if (digits.length === 9) local = `0${digits}`;
  else return null;

  // Safaricom/Airtel/Telkom mobile prefixes are all 07xx or 01xx, 10 digits.
  return /^0(7|1)\d{8}$/.test(local) ? local : null;
}

/** Sends the STK prompt to the customer's phone. */
export async function initiateStkPush(options: {
  amount: number;
  phone: string;
  reference: string;
  customerName: string;
  callbackUrl: string;
}): Promise<StkPushResult> {
  const token = basicToken();
  const channelId = Number(process.env.PAYHERO_CHANNEL_ID);

  if (!token || !Number.isFinite(channelId)) {
    return { ok: false, error: "Online payment is not configured yet." };
  }

  try {
    const response = await fetch(`${apiBase()}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
      },
      body: JSON.stringify({
        amount: options.amount,
        phone_number: options.phone,
        channel_id: channelId,
        provider: "m-pesa",
        external_reference: options.reference,
        customer_name: options.customerName,
        callback_url: options.callbackUrl,
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;

    if (!response.ok) {
      const message =
        typeof payload?.error_message === "string"
          ? payload.error_message
          : typeof payload?.message === "string"
            ? payload.message
            : `PayHero rejected the request (${response.status}).`;
      console.error("PayHero STK push failed", response.status, payload);
      return { ok: false, error: message };
    }

    const providerRef =
      typeof payload?.reference === "string"
        ? payload.reference
        : typeof payload?.CheckoutRequestID === "string"
          ? payload.CheckoutRequestID
          : undefined;

    return { ok: true, providerRef };
  } catch (error) {
    console.error("PayHero request threw", error);
    return { ok: false, error: "Could not reach M-Pesa. Please try again." };
  }
}

/**
 * Asks PayHero where a payment stands.
 *
 * The callback is the primary signal; this is the fallback for when it is
 * slow or cannot reach us (a localhost callback URL, for instance).
 *
 * The endpoint keys off PayHero's OWN reference — the one returned by the STK
 * push and stored as `providerRef` — and 404s on our `external_reference`, so
 * pass the provider reference whenever we have it.
 */
export async function checkTransactionStatus(
  reference: string,
  providerRef?: string | null,
): Promise<{ status: TransactionStatus; receipt?: string; reason?: string }> {
  const token = basicToken();
  if (!token) return { status: "PENDING" };

  const lookup = providerRef?.trim() || reference;

  try {
    const response = await fetch(
      `${apiBase()}/transaction-status?reference=${encodeURIComponent(lookup)}`,
      { headers: { Authorization: `Basic ${token}` }, cache: "no-store" },
    );

    if (!response.ok) {
      // A 404 simply means PayHero has not registered it yet.
      if (response.status !== 404) {
        console.error("PayHero status check returned", response.status, lookup);
      }
      return { status: "PENDING" };
    }

    const payload = (await response.json()) as Record<string, unknown>;
    return readOutcome(payload);
  } catch (error) {
    console.error("PayHero status check failed", error);
    return { status: "PENDING" };
  }
}

/**
 * Reads a payment outcome out of a PayHero body.
 *
 * Deliberately forgiving: the status endpoint and the webhook wrap the same
 * fields differently (sometimes under `response`), and field casing has
 * varied, so we look for the meaningful values wherever they sit.
 */
export function readOutcome(
  body: Record<string, unknown>,
): { status: TransactionStatus; receipt?: string; reason?: string } {
  const inner =
    body.response && typeof body.response === "object"
      ? (body.response as Record<string, unknown>)
      : body;

  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = inner[key] ?? body[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
  };

  const receiptValue = pick(
    "MpesaReceiptNumber",
    "mpesa_receipt_number",
    "provider_reference",
    "third_party_reference",
    "receipt",
  );
  const receipt = typeof receiptValue === "string" ? receiptValue : undefined;

  const reasonValue = pick("ResultDesc", "result_desc", "message", "error_message");
  const reason = typeof reasonValue === "string" ? reasonValue : undefined;

  // ResultCode 0 is M-Pesa's "success"; anything else is a real failure.
  const codeValue = pick("ResultCode", "result_code");
  if (codeValue !== undefined) {
    const code = Number(codeValue);
    if (Number.isFinite(code)) {
      if (code === 0) return { status: "PAID", receipt, reason };
      return { status: "FAILED", receipt, reason };
    }
  }

  const statusValue = pick("Status", "status");
  if (typeof statusValue === "string") {
    const status = statusValue.toUpperCase();
    if (["SUCCESS", "COMPLETED", "PAID", "SUCCESSFUL"].includes(status)) {
      return { status: "PAID", receipt, reason };
    }
    if (["FAILED", "CANCELLED", "CANCELED", "ERROR"].includes(status)) {
      return { status: "FAILED", receipt, reason };
    }
  }

  return { status: "PENDING", receipt, reason };
}
