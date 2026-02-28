'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isVerifiedPaid } from '../../../lib/paymentGate';
import { getShareTokenRecord } from '../../../lib/shareLink';

const READY_STORAGE_KEY = "exso:ready";

export default function XsoReadyPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [exsoId, setExsoId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [remainingUses, setRemainingUses] = useState(2);
  const [copyState, setCopyState] = useState<'idle' | 'done'>('idle');
  const [shareNotice, setShareNotice] = useState<string>('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isVerifiedPaid()) {
      router.replace('/pricing');
      return;
    }
    const raw = window.sessionStorage.getItem(READY_STORAGE_KEY);
    if (!raw) {
      router.replace('/xso');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { id?: string; payload?: string; token?: string };
      if (!parsed.id || !parsed.token) {
        router.replace('/xso');
        return;
      }
      setExsoId(parsed.id);
      setShareToken(parsed.token);
    } catch {
      router.replace('/xso');
    }
  }, [router]);

  const exsoLink =
    origin && exsoId && shareToken
      ? `${origin}/x/${exsoId}?k=${encodeURIComponent(shareToken)}`
      : '';
  const exsoDisplayLink =
    origin && exsoId && shareToken
      ? `${origin.replace(/^https?:\/\//, '')}/x/${exsoId.slice(0, 6)}-${shareToken.slice(0, 6)}`
      : '';
  useEffect(() => {
    if (!shareToken) {
      setRemainingUses(2);
      return;
    }
    const refreshRemaining = () => {
      const next = getShareTokenRecord(shareToken)?.usesRemaining ?? 2;
      setRemainingUses(next);
    };

    refreshRemaining();
    const intervalId = window.setInterval(refreshRemaining, 1000);
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "xso:share-links") return;
      refreshRemaining();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshRemaining();
      }
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [shareToken]);

  const copyLink = async () => {
    if (!exsoLink) return;
    await navigator.clipboard.writeText(exsoLink);
    setCopyState('done');
    window.setTimeout(() => setCopyState('idle'), 1600);
  };

  const whatsappShare = () => {
    if (!exsoLink) return;
    const text = encodeURIComponent('I wanted you to have this.');
    const url = encodeURIComponent(exsoLink);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const gmailShare = () => {
    if (!exsoLink) return;
    const subject = encodeURIComponent('A private XSO for you');
    const body = encodeURIComponent(`I wanted you to have this.\n\n${exsoLink}\n\nThis link can be opened two times.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareAnywhere = async () => {
    if (!exsoLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'XSO',
          text: 'I wanted you to have this.',
          url: exsoLink,
        });
        setShareNotice('Shared.');
        window.setTimeout(() => setShareNotice(''), 1500);
        return;
      } catch {
      }
    }
    await copyLink();
  };

  return (
    <div className="min-h-screen w-full font-serif text-ink-charcoal antialiased selection:bg-stone-300 selection:text-black bg-ritual-gradient flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center w-full px-6 py-12">
        <section className="w-full max-w-xl rounded-[20px] border border-stone-200/70 bg-white/70 p-6 md:p-8 shadow-[0_18px_36px_rgba(40,40,40,0.08)] backdrop-blur-sm">
          <header className="space-y-4 text-center">
            <p className="text-[13px] md:text-[14px] text-ink-charcoal/60 font-medium tracking-wide">
              Your XSO has been created.
            </p>
            <h1 className="text-[30px] md:text-[34px] leading-[1.25] font-medium text-[#4b4a46]">
              Share this private link
            </h1>
            <p className="text-[14px] text-[#5d5951] leading-relaxed">
              This link is unique and can be opened <span className="font-medium">2 times</span>.
            </p>
          </header>

          <div className="mt-8 rounded-xl border border-stone-200 bg-white px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7a756c]">Unique Link</p>
            <p className="mt-2 break-all text-[12px] leading-relaxed text-[#4a453e]">
              {exsoDisplayLink || 'Preparing link...'}
            </p>
            <p className="mt-3 text-[12px] text-[#6f6a61]">
              Remaining opens: {remainingUses}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={copyLink}
              className="btn-secondary w-full"
            >
              {copyState === 'done' ? 'Copied' : 'Copy private link'}
            </button>
            <button
              type="button"
              onClick={whatsappShare}
              className="btn-secondary w-full"
            >
              Share on WhatsApp
            </button>
            <button
              type="button"
              onClick={gmailShare}
              className="btn-secondary w-full"
            >
              Share via Gmail
            </button>
            <button
              type="button"
              onClick={shareAnywhere}
              className="btn-secondary w-full"
            >
              Share on another app
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[12px] text-[#6f6a61]">
              {shareNotice || 'You can send this on any platform using the same link.'}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
