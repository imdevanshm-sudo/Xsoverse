const PAYMENT_SESSION_KEY = "xsoverse:checkoutSessionId";
const PAYMENT_SESSION_AT_KEY = "xsoverse:checkoutSessionAt";
const PAYMENT_SESSION_TTL_MS = 30 * 60 * 1000;
const PAYMENT_NONCE_KEY = "xsoverse:paymentNonce";
const PAYMENT_NONCE_AT_KEY = "xsoverse:paymentNonceAt";
const PAYMENT_NONCE_TTL_MS = 15 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined";

export const storeCheckoutSession = (sessionId: string) => {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(PAYMENT_SESSION_KEY, sessionId);
  window.sessionStorage.setItem(PAYMENT_SESSION_AT_KEY, `${Date.now()}`);
};

export const readCheckoutSession = () => {
  if (!isBrowser()) return null;
  const sessionId = window.sessionStorage.getItem(PAYMENT_SESSION_KEY);
  const issuedAt = Number(window.sessionStorage.getItem(PAYMENT_SESSION_AT_KEY) ?? 0);
  if (!sessionId || !issuedAt) return null;
  if (Date.now() - issuedAt > PAYMENT_SESSION_TTL_MS) return null;
  return sessionId;
};

export const clearCheckoutSession = () => {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(PAYMENT_SESSION_KEY);
  window.sessionStorage.removeItem(PAYMENT_SESSION_AT_KEY);
};

const createNonce = () => {
  if (!isBrowser()) return "";
  if (typeof window.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(12);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(16).slice(2);
};

export const setPaymentNonce = () => {
  if (!isBrowser()) return "";
  const nonce = createNonce();
  window.sessionStorage.setItem(PAYMENT_NONCE_KEY, nonce);
  window.sessionStorage.setItem(PAYMENT_NONCE_AT_KEY, `${Date.now()}`);
  return nonce;
};

export const hasValidPaymentNonce = () => {
  if (!isBrowser()) return false;
  const nonce = window.sessionStorage.getItem(PAYMENT_NONCE_KEY);
  const issuedAt = Number(window.sessionStorage.getItem(PAYMENT_NONCE_AT_KEY) ?? 0);
  if (!nonce || !issuedAt) return false;
  if (Date.now() - issuedAt > PAYMENT_NONCE_TTL_MS) return false;
  return true;
};

export const readPaymentNonce = () => {
  if (!isBrowser()) return null;
  const nonce = window.sessionStorage.getItem(PAYMENT_NONCE_KEY);
  const issuedAt = Number(window.sessionStorage.getItem(PAYMENT_NONCE_AT_KEY) ?? 0);
  if (!nonce || !issuedAt) return null;
  if (Date.now() - issuedAt > PAYMENT_NONCE_TTL_MS) return null;
  return nonce;
};

export const clearPaymentNonce = () => {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(PAYMENT_NONCE_KEY);
  window.sessionStorage.removeItem(PAYMENT_NONCE_AT_KEY);
};

export const setVerifiedPaid = () => {
  if (!isBrowser()) return;
  window.sessionStorage.setItem("xsoverse:paid", "true");
};

export const setPaidFlag = () => {
  setVerifiedPaid();
};

export const clearVerifiedPaid = () => {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem("xsoverse:paid");
};

export const isVerifiedPaid = () => {
  if (!isBrowser()) return false;
  return window.sessionStorage.getItem("xsoverse:paid") === "true";
};
