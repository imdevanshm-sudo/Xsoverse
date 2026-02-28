import { NextResponse } from "next/server";
import { LEMONSQUEEZY_BASE_URL } from "../../../lib/lemonsqueezy";

export async function POST(request: Request) {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

  if (!apiKey || !storeId || !variantId) {
    return NextResponse.json({
      providerNotConfigured: true,
      reason: "not_configured",
    });
  }

  const rawBody = await request.text().catch(() => "{}");
  let bodyPayload: { paymentNonce?: string } = {};

  try {
    bodyPayload = JSON.parse(rawBody);
  } catch (err) {
    console.error("Failed to parse checkout request body:", rawBody);
    return NextResponse.json({
      error: "Malformed checkout request.",
      details: rawBody,
    }, { status: 400 });
  }
  const paymentNonce = String(bodyPayload.paymentNonce ?? "").trim();
  const { origin } = new URL(request.url);
  const successUrl = `${origin}/payment/success?provider=ls&nonce=${encodeURIComponent(paymentNonce)}`;
  const cancelUrl = `${origin}/pricing`;
  const isProd = process.env.NODE_ENV === "production";

  const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/v1/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            embed: 1,
            media: 1,
            logo: 1,
            desc: 1,
            discount: 0,
          },
          checkout_data: {
            custom: {
              payment_nonce: paymentNonce,
            },
          },
          product_options: {
            redirect_url: successUrl,
            enabled_variants: [variantId],
            name: "XSO",
            description: "One-time private XSO experience",
            receipt_button_text: "Return to XSO",
            receipt_link_url: successUrl,
          },
          expires_at: null,
          preview: false,
          test_mode: !isProd,
          custom_price: null,
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const upstreamText = await response.text().catch(() => "");
    console.error("LEMON SQUEEZY CHECKOUT ERROR:", { status: response.status, upstreamText });
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      return NextResponse.json(
        {
          error: "Unable to create checkout session.",
          provider: "lemonsqueezy",
          status: response.status,
          details: upstreamText || "No response body from provider.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }

  const payload = (await response.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const url = payload?.data?.attributes?.url;
  if (!url) {
    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
  return NextResponse.json({ url });
}
