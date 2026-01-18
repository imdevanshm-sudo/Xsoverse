"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useExsoDraft } from "../../../lib/exsoDraft";

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const replyTo = searchParams.get("replyTo") ?? undefined;
  const nextPath = searchParams.get("next") ?? "/xso/quiet";
  const exsoType = searchParams.get("exsoType") ?? "thinking_of_you";
  const { draft, setDraft } = useExsoDraft();

  const isReply = exsoType === "reply_exso" || Boolean(replyTo);

  useEffect(() => {
    const nextType = exsoType === "reply_exso" ? "reply_exso" : "thinking_of_you";
    if (draft.type === nextType && draft.replyToExsoId === replyTo) {
      return;
    }
    if (replyTo && !draft.replyToExsoId) {
      setDraft({
        ...draft,
        type: nextType,
        replyToExsoId: replyTo,
      });
      return;
    }
    if (!replyTo && draft.replyToExsoId) {
      setDraft({
        ...draft,
        type: nextType,
        replyToExsoId: undefined,
      });
      return;
    }
    if (draft.type !== nextType) {
      setDraft({
        ...draft,
        type: nextType,
      });
    }
  }, [exsoType, replyTo, draft, setDraft]);

  const nextHref = useMemo(() => {
    if (!replyTo) return nextPath;
    const separator = nextPath.includes("?") ? "&" : "?";
    return `${nextPath}${separator}replyTo=${encodeURIComponent(replyTo)}`;
  }, [nextPath, replyTo]);

  const onContinue = () => {
    router.push(nextHref);
  };

  return (
    <div className="min-h-screen w-full font-serif text-ink-charcoal antialiased selection:bg-stone-300 selection:text-black bg-ritual-gradient flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center w-full px-6 py-12">
        <section className="w-full max-w-md text-center space-y-6">
          {isReply ? (
            <p className="text-[13px] md:text-[14px] text-ink-charcoal/60 font-medium tracking-wide">
              Replies are created as their own Exso.
            </p>
          ) : (
            <>
              <h1 className="text-[28px] md:text-[32px] leading-snug font-medium text-[#4b4a46]">
                Payment is required to create this Exso.
              </h1>
              <p className="text-[14px] md:text-[15px] text-ink-charcoal/70 leading-relaxed">
                This is the same step for every Exso.
              </p>
            </>
          )}
          <div className="flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={onContinue}
              className="rounded-xl px-6 py-3 text-sm font-medium tracking-wide text-[#4b4a46] transition-colors border border-[#cfcac2] bg-white hover:bg-[#f7f5f1]"
            >
              Continue
            </button>
            <p className="text-[12px] text-ink-charcoal/60">
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
        </section>
      </main>
    </div>
  );
}

function PaymentFallback() {
  return (
    <div className="min-h-screen w-full font-serif text-ink-charcoal antialiased selection:bg-stone-300 selection:text-black bg-ritual-gradient flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center w-full px-6 py-12">
        <section className="w-full max-w-md text-center space-y-6">
          <p className="text-[13px] md:text-[14px] text-ink-charcoal/60 font-medium tracking-wide">
            Preparing this step.
          </p>
        </section>
      </main>
    </div>
  );
}
