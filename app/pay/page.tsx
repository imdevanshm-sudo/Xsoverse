"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { persistDraftToSession, useExsoDraft } from "../../lib/exsoDraft";

export default function PayPage() {
  const router = useRouter();
  const { draft } = useExsoDraft();
  useEffect(() => {
    if (!draft.type || !draft.identity) {
      router.replace("/xso/quiet");
      return;
    }
    if (!draft.weight) {
      router.replace("/create/weight");
    }
  }, [router, draft.type, draft.identity, draft.weight]);

  const handleCheckout = () => {
    persistDraftToSession(draft);
    router.push("/payment-preview");
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
        >
          Continue to payment
        </button>
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
