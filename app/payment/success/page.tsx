"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearPaymentNonce,
  readPaymentNonce,
  setPaidFlag,
} from "../../../lib/paymentGate";

import { Suspense } from "react";

function PaymentSuccessContent() {
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

  return null;
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
      <div className="text-center">
        <p className="text-sm text-[#5b5751] opacity-70">Payment confirmed. Preparing your XSO.</p>
        <Suspense fallback={<p className="mt-2 text-xs italic text-[#aaaaaa]">Verifying...</p>}>
          <PaymentSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
