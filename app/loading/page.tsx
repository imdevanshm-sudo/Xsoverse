"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createExso } from "../../lib/createExso";
import { useExsoDraft, loadDraftFromSession, clearDraftFromSession } from "../../lib/exsoDraft";
import { saveExso } from "../../lib/exsoStore";
import { isVerifiedPaid } from "../../lib/paymentGate";
import { createTwoUseShareToken } from "../../lib/shareLink";

const LINES = [
  "Payment confirmed. Preparing your XSO.",
  "Putting this together.",
  "This won’t take long.",
  "Almost ready.",
];

const READY_STORAGE_KEY = "exso:ready";

export default function LoadingPage() {
  const router = useRouter();
  const { resetDraft } = useExsoDraft();
  const createdRef = useRef(false);
  const redirectTargetRef = useRef<string | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (createdRef.current) return;
    const verified = isVerifiedPaid();
    if (!verified) {
      router.replace("/pricing");
      return;
    }
    const storedDraft = loadDraftFromSession();
    if (!storedDraft?.type || !storedDraft.identity || !storedDraft.weight) {
      router.replace("/xso/quiet");
      return;
    }

    const exso = createExso(storedDraft);
    saveExso(exso);
    void fetch("/api/exso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exso),
      keepalive: true,
    }).catch(() => {});
    resetDraft();
    clearDraftFromSession();

    const token = createTwoUseShareToken(exso.id);
    try {
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(exso))));
      window.sessionStorage.setItem(
        READY_STORAGE_KEY,
        JSON.stringify({ id: exso.id, payload: encoded, token })
      );
    } catch {
      window.sessionStorage.setItem(
        READY_STORAGE_KEY,
        JSON.stringify({ id: exso.id, token })
      );
    }

    redirectTargetRef.current = "/xso/ready";

    createdRef.current = true;
  }, [router, resetDraft]);

  useEffect(() => {
    setIsVisible(true);
    const interval = window.setInterval(() => {
      setIsVisible(false);
      window.setTimeout(() => {
        setLineIndex((prev) => (prev + 1) % LINES.length);
        setIsVisible(true);
      }, 800);
    }, 1700);

    const redirectTimeout = window.setTimeout(() => {
      const target = redirectTargetRef.current ?? "/xso/ready";
      router.replace(target);
    }, 4500);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p
        className={`text-sm opacity-70 transition-opacity duration-[1400ms] ${
          isVisible ? "opacity-70" : "opacity-0"
        }`}
      >
        {LINES[lineIndex]}
      </p>
    </div>
  );
}
