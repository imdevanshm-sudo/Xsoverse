import type { Exso } from "./types";

const exsoStore = new Map<string, Exso>();
const STORAGE_KEY = "exsoStore";

function assertImmutableReply(exso: Exso, previous?: Exso) {
  if (previous?.replyToExsoId && exso.replyToExsoId !== previous.replyToExsoId) {
    throw new Error("replyToExsoId is immutable");
  }
}

export function saveExso(exso: Exso) {
  assertImmutableReply(exso, exsoStore.get(exso.id));
  exsoStore.set(exso.id, exso);
  if (typeof window !== "undefined") {
    const stored = Object.fromEntries(exsoStore.entries());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }
}

export function getExso(id: string) {
  if (exsoStore.has(id)) {
    return exsoStore.get(id) ?? null;
  }
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, Exso>;
    const found = parsed[id] ?? null;
    if (found) {
      exsoStore.set(id, found);
    }
    return found;
  }
  return null;
}
