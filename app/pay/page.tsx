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
    router.replace("/pricing");
  };

  return (
    <div className="min-h-screen w-full font-serif text-ink-charcoal antialiased selection:bg-stone-300 selection:text-black bg-ritual-gradient flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <section className="w-full max-w-md rounded-[20px] border border-stone-200/70 bg-white/70 p-6 md:p-8 text-center shadow-[0_18px_36px_rgba(40,40,40,0.08)] backdrop-blur-sm">
          <p className="text-sm text-ink-charcoal/70">
            Your XSO is almost ready for checkout.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 text-[12px] text-[#6f6a61] sm:grid-cols-3">
            <p>Secure checkout</p>
            <p>One-time payment</p>
            <p>Instant private link</p>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            className="btn-secondary mt-8 w-full"
          >
            Go to secure checkout
          </button>
          <p className="mt-4 text-[12px] opacity-60">
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
        </section>
      </main>
    </div>
  );
}
