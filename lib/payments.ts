export type CheckoutResult =
  | { kind: "redirect"; url: string }
  | { kind: "preview" }
  | { kind: "error" };

export async function requestCheckoutSession(): Promise<CheckoutResult> {
  try {
    const response = await fetch("/api/checkout", { method: "POST" });
    if (!response.ok) {
      return { kind: "error" };
    }
    const payload = (await response.json()) as { url?: string; preview?: boolean };
    if (payload.preview) {
      return { kind: "preview" };
    }
    if (payload.url) {
      return { kind: "redirect", url: payload.url };
    }
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}
