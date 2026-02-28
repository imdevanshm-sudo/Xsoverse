export type CheckoutResult =
  | { kind: "redirect"; url: string }
  | { kind: "provider_not_configured" }
  | { kind: "error" };

export async function requestCheckoutSession(
  paymentNonce?: string
): Promise<CheckoutResult> {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentNonce: paymentNonce ?? "",
      }),
    });
    if (!response.ok) {
      return { kind: "error" };
    }
    const payload = (await response.json()) as {
      url?: string;
      providerNotConfigured?: boolean;
    };
    if (payload.providerNotConfigured) {
      return { kind: "provider_not_configured" };
    }
    if (payload.url) {
      return { kind: "redirect", url: payload.url };
    }
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}
