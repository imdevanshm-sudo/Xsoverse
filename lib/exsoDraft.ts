import { useEffect, useState } from "react";
import { exsoDraft, resetExsoDraft } from "./exsoFlow";
import type { ExsoDraft } from "./exsoFlow";

type DraftListener = (draft: ExsoDraft) => void;

const listeners = new Set<DraftListener>();
const DRAFT_STORAGE_KEY = "exso:draft";

function publish() {
  const snapshot = { ...exsoDraft };
  listeners.forEach((listener) => listener(snapshot));
}

export function setDraft(nextDraft: ExsoDraft) {
  Object.keys(exsoDraft).forEach((key) => {
    delete (exsoDraft as Record<string, unknown>)[key];
  });
  Object.assign(exsoDraft, nextDraft);
  publish();
}

export function resetDraft() {
  resetExsoDraft();
  publish();
}

export function persistDraftToSession(draft: ExsoDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function loadDraftFromSession() {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ExsoDraft;
  } catch {
    return null;
  }
}

export function clearDraftFromSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function useExsoDraft() {
  const [draft, setDraftState] = useState<ExsoDraft>({ ...exsoDraft });

  useEffect(() => {
    const listener: DraftListener = (nextDraft) => {
      setDraftState(nextDraft);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { draft, setDraft, resetDraft };
}
