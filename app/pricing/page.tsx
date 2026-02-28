"use client";

import { useState, useEffect } from "react";
import { persistDraftToSession, useExsoDraft, loadDraftFromSession } from "../../lib/exsoDraft";
import { requestCheckoutSession } from "../../lib/payments";
import { clearPaymentNonce, setPaymentNonce } from "../../lib/paymentGate";
import { useRouter } from "next/navigation";
import Script from "next/script";

// Add global declaration for LemonSqueezy script
declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Setup: (options: {
        eventHandler: (event: { event: string }) => void;
      }) => void;
    };
    createLemonSqueezy?: () => void;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const { draft, setDraft } = useExsoDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providerUnavailable, setProviderUnavailable] = useState(false);

  useEffect(() => {
    // If in-memory draft is empty (e.g. user refreshed the page directly on /pricing),
    // attempt to restore it from session storage so checkout can succeed.
    if (!draft?.type || !draft?.identity || !draft?.weight) {
      const stored = loadDraftFromSession();
      if (stored?.type && stored?.identity && stored?.weight) {
        setDraft(stored);
      }
    }
  }, [draft?.type, draft?.identity, draft?.weight, setDraft]);
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="lazyOnload" onLoad={() => {
        window.createLemonSqueezy?.();
        if (window.LemonSqueezy?.Setup) {
          window.LemonSqueezy.Setup({
            eventHandler: (event: any) => {
              if (event.event === "Checkout.Success") {
                window.LemonSqueezy?.Url?.Close?.();
                // Lemon Squeezy passes checkout data in the event. Try to extract our custom nonce if possible.
                const paymentNonce = event.data?.checkout_data?.custom?.payment_nonce;
                if (paymentNonce) {
                  window.location.href = `/payment/success?provider=ls&nonce=${encodeURIComponent(paymentNonce)}`;
                } else {
                  // Fallback: Just redirect, and success page will attempt to read from sessionStorage.
                  window.location.href = "/payment/success?provider=ls";
                }
              }
            },
          });
        }
      }} />
      <div className="mx-auto flex min-h-[120vh] w-full max-w-3xl px-6 pb-40 pt-24 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col items-center justify-center text-center">
          <header className="space-y-6">
            <h1 className="text-[24px] leading-[1.6] text-[#3f3f3b]">XSO</h1>
            <p className="text-[15px] leading-[1.9] text-[#5b5751]">
              XSO is a one-time digital purchase.
            </p>
          </header>

          <div className="py-12">
            <p className="text-[28px] leading-[1.4] text-[#3f3f3b]">$15 USD</p>
          </div>

          <div className="mt-10 grid w-full max-w-md grid-cols-1 gap-2 text-[12px] text-[#6f6a61] sm:grid-cols-3">
            <p>Secure checkout</p>
            <p>One-time payment</p>
            <p>Instant private link</p>
          </div>

          <div className="mt-10">
            <button
              type="button"
              disabled={isSubmitting || providerUnavailable}
              onClick={async () => {
                if (isSubmitting || providerUnavailable) return;
                if (!draft?.type || !draft?.identity || !draft?.weight) {
                  router.replace("/xso/quiet");
                  return;
                }
                setIsSubmitting(true);
                persistDraftToSession(draft);
                try {
                  const paymentNonce = setPaymentNonce();
                  const result = await requestCheckoutSession(paymentNonce);
                  if (result.kind === "redirect") {
                    console.log("LemonSqueezy Checkout URL:", result.url);
                    if (window.LemonSqueezy?.Url?.Open) {
                      window.LemonSqueezy.Url.Open(result.url);
                    } else {
                      window.location.href = result.url;
                    }
                    return;
                  }
                  if (result.kind === "provider_not_configured") {
                    clearPaymentNonce();
                    setProviderUnavailable(true);
                    return;
                  }
                  clearPaymentNonce();
                } catch {
                  clearPaymentNonce();
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="btn-primary w-full"
            >
              {isSubmitting ? "Opening secure checkout..." : "Pay $15 securely"}
            </button>
            {providerUnavailable ? (
              <p className="mt-3 text-xs text-[#7a5f4f]">
                Payment is temporarily unavailable. Please try again shortly.
              </p>
            ) : null}
          </div>

        </article>
      </div>
    </div>
  );
}
