const SHARE_LINK_STORAGE_KEY = "xso:share-links";

type ShareLinkRecord = {
  exsoId: string;
  usesRemaining: number;
  createdAt: number;
  lastOpenedAt?: number;
};

type ShareLinkStore = Record<string, ShareLinkRecord>;

const isBrowser = () => typeof window !== "undefined";

const readStore = (): ShareLinkStore => {
  if (!isBrowser()) return {};
  const raw = window.localStorage.getItem(SHARE_LINK_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ShareLinkStore;
  } catch {
    return {};
  }
};

const writeStore = (store: ShareLinkStore) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(SHARE_LINK_STORAGE_KEY, JSON.stringify(store));
};

const createToken = () => {
  if (!isBrowser()) return "";
  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  if (typeof window.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
};

export const createTwoUseShareToken = (exsoId: string) => {
  if (!isBrowser()) return "";
  const store = readStore();
  let token = createToken();
  let attempts = 0;
  while (!token || store[token]) {
    token = createToken();
    attempts += 1;
    if (attempts > 5) break;
  }
  if (!token) return "";
  store[token] = {
    exsoId,
    usesRemaining: 2,
    createdAt: Date.now(),
  };
  writeStore(store);
  return token;
};

export const getShareTokenRecord = (token: string) => {
  if (!token || !isBrowser()) return null;
  const store = readStore();
  return store[token] ?? null;
};

export const consumeShareToken = (
  token: string,
  exsoId: string
): { ok: boolean; usesRemaining: number; reason?: "invalid" | "mismatch" | "exhausted" } => {
  if (!token || !isBrowser()) {
    return { ok: false, usesRemaining: 0, reason: "invalid" };
  }

  const store = readStore();
  const found =
    store[token] ??
    ({
      exsoId,
      usesRemaining: 2,
      createdAt: Date.now(),
    } satisfies ShareLinkRecord);
  if (found.exsoId !== exsoId) {
    return { ok: false, usesRemaining: 0, reason: "mismatch" };
  }
  if (found.usesRemaining <= 0) {
    return { ok: false, usesRemaining: 0, reason: "exhausted" };
  }

  const next = {
    ...found,
    usesRemaining: found.usesRemaining - 1,
    lastOpenedAt: Date.now(),
  };
  store[token] = next;
  writeStore(store);

  return { ok: true, usesRemaining: next.usesRemaining };
};
