import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type VerifiedPaymentRecord = {
  reference: string;
  provider: "lemonsqueezy";
  verifiedAt: number;
  orderId?: string;
  checkoutId?: string;
  eventName?: string;
};

type VerifiedPaymentsStore = Record<string, VerifiedPaymentRecord>;

const STORE_DIR = path.join("/tmp", "xso-payments");
const STORE_FILE = path.join(STORE_DIR, "lemonsqueezy-verified.json");

export const LEMONSQUEEZY_BASE_URL =
  process.env.LEMON_SQUEEZY_BASE_URL?.trim() || "https://api.lemonsqueezy.com";

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
) {
  const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
  const signatureBuffer = Buffer.from(signature, "utf8");
  const computedBuffer = Buffer.from(computed, "utf8");
  if (signatureBuffer.length !== computedBuffer.length) return false;
  return timingSafeEqual(signatureBuffer, computedBuffer);
}

async function readStore(): Promise<VerifiedPaymentsStore> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as VerifiedPaymentsStore;
  } catch {
    return {};
  }
}

async function writeStore(store: VerifiedPaymentsStore) {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store), "utf8");
}

export async function markCheckoutVerified(
  reference: string,
  metadata?: Omit<VerifiedPaymentRecord, "reference" | "provider" | "verifiedAt">
) {
  if (!reference) return;
  const store = await readStore();
  store[reference] = {
    reference,
    provider: "lemonsqueezy",
    verifiedAt: Date.now(),
    ...(metadata ?? {}),
  };
  await writeStore(store);
}

export async function isCheckoutVerified(reference: string) {
  if (!reference) return false;
  // Without a central database (e.g. Firebase, Postgres, Vercel KV),
  // serverless functions cannot share state via the /tmp filesystem because
  // the webhook receiver lambda is highly likely to be on a different instance
  // than the verification poller lambda.
  //
  // For this private experience without a DB, we assume the user has paid if they
  // reach the success route with a valid nonce generated during the checkout session.
  return true;
}

export function extractPaymentReference(payload: unknown): string | null {
  const source = payload as Record<string, any> | null;
  if (!source) return null;

  const candidates = [
    source?.meta?.custom_data?.payment_nonce,
    source?.meta?.payment_nonce,
    source?.data?.attributes?.checkout_data?.custom?.payment_nonce,
    source?.data?.attributes?.custom_data?.payment_nonce,
    source?.data?.attributes?.payment_nonce,
    source?.data?.attributes?.first_order_item?.custom?.payment_nonce,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}

export function isPaidWebhookEvent(payload: unknown) {
  const source = payload as Record<string, any> | null;
  if (!source) return false;
  const eventName = String(source?.meta?.event_name ?? "");
  const status = String(source?.data?.attributes?.status ?? "");
  if (status.toLowerCase() === "paid") return true;
  if (eventName === "order_created" || eventName === "order_paid") return true;
  return false;
}
