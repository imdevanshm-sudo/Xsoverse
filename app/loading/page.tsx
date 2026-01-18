"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createExso } from "../../lib/createExso";
import { useExsoDraft, loadDraftFromSession, clearDraftFromSession } from "../../lib/exsoDraft";
import { saveExso } from "../../lib/exsoStore";

const LINES = [
  "Taking a moment…",
  "Putting this together.",
  "This won’t take long.",
  "Almost ready.",
];

const READY_STORAGE_KEY = "exso:ready";

export default function LoadingPage() {
  const router = useRouter();
  const { resetDraft } = useExsoDraft();
  const createdRef = useRef(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (createdRef.current) return;
    const storedDraft = loadDraftFromSession();
    if (!storedDraft?.type || !storedDraft.identity || !storedDraft.weight) {
      router.replace("/xso/quiet");
      return;
    }

    const exso = createExso(storedDraft);
    saveExso(exso);
    resetDraft();
    clearDraftFromSession();

    try {
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(exso))));
      window.sessionStorage.setItem(
        READY_STORAGE_KEY,
        JSON.stringify({ id: exso.id, payload: encoded })
      );
    } catch {
      window.sessionStorage.setItem(
        READY_STORAGE_KEY,
        JSON.stringify({ id: exso.id })
      );
    }

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
      router.replace("/xso/ready");
    }, 7000);

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
