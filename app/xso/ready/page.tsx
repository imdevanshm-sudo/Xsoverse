'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';

const READY_STORAGE_KEY = "exso:ready";

export default function XsoReadyPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [exsoId, setExsoId] = useState<string | null>(null);
  const [exsoPayload, setExsoPayload] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(READY_STORAGE_KEY);
    if (!raw) {
      router.replace('/xso');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { id?: string; payload?: string };
      if (!parsed.id) {
        router.replace('/xso');
        return;
      }
      setExsoId(parsed.id);
      setExsoPayload(parsed.payload ?? null);
    } catch {
      router.replace('/xso');
    }
  }, [router]);

  const exsoLink =
    origin && exsoId
      ? `${origin}/exso/${exsoId}${exsoPayload ? `?d=${encodeURIComponent(exsoPayload)}` : ''}`
      : '';
  const exsoDisplayLink =
    origin && exsoId ? `${origin}/exso/${exsoId.slice(0, 3)}` : '';

  const copyLink = async () => {
    if (!exsoLink) return;
    await navigator.clipboard.writeText(exsoLink);
  };

  const whatsappShare = () => {
    if (!exsoLink) return;
    const text = encodeURIComponent('I wanted you to have this.');
    const url = encodeURIComponent(exsoLink);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const downloadQR = async () => {
    if (!exsoLink) return;
    const dataUrl = await QRCode.toDataURL(exsoLink);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'exso.png';
    a.click();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F8F8F6] p-6 text-center font-manrope text-gray-700">
      <div className="z-10 flex w-full max-w-sm flex-col items-center space-y-12">
        <div className="space-y-4">
          <p className="text-sm italic text-gray-400">Nothing else is required.</p>
          <h1 className="text-3xl font-light tracking-tight text-[#1C1C1C] font-serif">
            Your Exso is ready
          </h1>
        </div>

        <div className="w-full space-y-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <span className="text-sm font-mono tracking-wide text-[#1C1C1C]/60">
                {exsoDisplayLink || '...'}
              </span>
              <button
                onClick={copyLink}
                className="text-xs font-medium uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-600"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={whatsappShare}
              className="text-sm font-light text-gray-400 transition-colors hover:text-gray-600"
            >
              Share via WhatsApp
            </button>
            <button
              onClick={downloadQR}
              className="text-sm font-light text-gray-400 transition-colors hover:text-gray-600"
            >
              Download QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
