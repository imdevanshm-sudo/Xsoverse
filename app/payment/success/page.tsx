"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearPaymentNonce,
  readPaymentNonce,
  setPaidFlag,
} from "../../../lib/paymentGate";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const provider = searchParams.get("provider");
    const nonceFromUrl = searchParams.get("nonce");
    const nonce = nonceFromUrl || readPaymentNonce();
    if (provider !== "ls" || !nonce) {
      clearPaymentNonce();
      router.replace("/pricing");
      return;
    }

    let active = true;
    const timeoutMs = 12_000;
    const intervalMs = 1_000;
    const startedAt = Date.now();

    const poll = async () => {
      while (active && Date.now() - startedAt < timeoutMs) {
        try {
          const response = await fetch(
            `/api/payment/verify?nonce=${encodeURIComponent(nonce)}`,
            { cache: "no-store" }
          );
          if (response.ok) {
            const payload = (await response.json()) as { verified?: boolean };
            if (payload.verified) {
              setPaidFlag();
              clearPaymentNonce();
              router.replace("/loading");
              return;
            }
          }
        } catch {
        }
        await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
      }

      if (!active) return;
      clearPaymentNonce();
      router.replace("/pricing?payment=unverified");
    };

    void poll();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm opacity-70">Payment confirmed. Preparing your XSO.</p>
    </div>
  );
}
