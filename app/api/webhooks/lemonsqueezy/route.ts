import { NextResponse } from "next/server";
import {
  extractPaymentReference,
  isPaidWebhookEvent,
  markCheckoutVerified,
  verifyWebhookSignature,
} from "../../../../lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const rawBody = await request.text();
  const valid = verifyWebhookSignature(rawBody, signature, secret);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isPaidWebhookEvent(payload)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const reference = extractPaymentReference(payload);
  if (!reference) {
    return NextResponse.json({ ok: true, ignored: true, reason: "missing_reference" });
  }

  const source = payload as Record<string, any>;
  await markCheckoutVerified(reference, {
    eventName: source?.meta?.event_name,
    orderId: String(source?.data?.id ?? ""),
    checkoutId: String(source?.data?.attributes?.identifier ?? ""),
  });

  return NextResponse.json({ ok: true });
}
