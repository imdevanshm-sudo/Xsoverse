import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secretKey || !priceId) {
    // Payment intentionally disabled during review or not configured
    return NextResponse.json({ preview: true, reason: "not_configured" });
  }

  const { origin } = new URL(request.url);
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/loading`,
    cancel_url: `${origin}/create/weight`,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }

  const payload = (await response.json()) as { url?: string };
  return NextResponse.json({ url: payload.url });
}
