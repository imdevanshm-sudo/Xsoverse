"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { persistDraftToSession, useExsoDraft } from "../../lib/exsoDraft";
import { requestCheckoutSession } from "../../lib/payments";

export default function PayPage() {
  const router = useRouter();
  const { draft } = useExsoDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!draft.type || !draft.identity) {
      router.replace("/xso/quiet");
      return;
    }
    if (!draft.weight) {
      router.replace("/create/weight");
    }
  }, [router, draft.type, draft.identity, draft.weight]);

  const handleCheckout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    persistDraftToSession(draft);
    const result = await requestCheckoutSession();
    if (result.kind === "preview") {
      router.push("/payment-preview");
      return;
    }
    if (result.kind === "redirect") {
      window.location.assign(result.url);
      return;
    }
    setStatusMessage("Payments are not ready yet. Please check back soon.");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-sm opacity-70">
          This Exso will be created deliberately.
        </p>

        <button
          type="button"
          onClick={handleCheckout}
          className="px-4 py-2 text-sm opacity-80 hover:opacity-100"
          disabled={isSubmitting}
        >
          Continue to payment
        </button>
        {statusMessage ? (
          <p className="text-[12px] opacity-60">{statusMessage}</p>
        ) : null}
        <p className="text-[12px] opacity-60">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/refund" className="underline underline-offset-4">
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
