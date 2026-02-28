'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Html2Canvas = (
  element: HTMLElement,
  options?: {
    backgroundColor?: string;
    scale?: number;
    logging?: boolean;
    useCORS?: boolean;
    allowTaint?: boolean;
    onclone?: (clonedDoc: Document) => void;
  }
) => Promise<HTMLCanvasElement>;

declare global {
  interface Window {
    html2canvas?: Html2Canvas;
  }
}

const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load html2canvas script'));
    document.head.appendChild(script);
  });
};

const END_LETTER_STORAGE_KEY = "xso:end-letter";

type LetterData = {
  to: string;
  from: string;
  closingLine: string;
  dedication?: string;
  date: string;
};

function ExsoEndContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [letterData, setLetterData] = useState<LetterData>(() => ({
    to: 'You',
    from: 'Someone',
    closingLine:
      'I still look for you in the spaces between seconds. Some distances are measured not in miles, but in silence.',
    dedication: '',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }));
  const letterRef = useRef<HTMLDivElement | null>(null);

  const mode = searchParams.get('mode');
  const replyTo = searchParams.get('replyTo');

  const nextHref = useMemo(() => {
    if (mode === 'reply' && replyTo) {
      return `/xso/quiet?replyTo=${encodeURIComponent(replyTo)}`;
    }
    return '/';
  }, [mode, replyTo]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 100);
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js').catch(() => { });
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(END_LETTER_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<LetterData>;
      if (!parsed.closingLine) return;
      setLetterData((previous) => ({
        to: parsed.to?.trim() || previous.to,
        from: parsed.from?.trim() || previous.from,
        closingLine: parsed.closingLine?.trim() || previous.closingLine,
        dedication: parsed.dedication?.trim() || '',
        date: parsed.date?.trim() || previous.date,
      }));
    } catch {
    }
  }, []);

  const handleSaveSnapshot = async () => {
    if (!letterRef.current || typeof window.html2canvas === 'undefined') return;

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await window.html2canvas(letterRef.current, {
        backgroundColor: '#efebe4',
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const seal = clonedDoc.querySelector('.wax-seal-outer') as HTMLElement | null;
          if (seal) {
            seal.style.boxShadow = '2px 4px 8px rgba(0,0,0,0.3)';
          }
          const textElements = clonedDoc.querySelectorAll('.ink-text');
          textElements.forEach((el) => {
            (el as HTMLElement).style.opacity = '0.85';
          });
        },
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `Letter-for-${letterData.to}-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to save snapshot', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseBook = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(END_LETTER_STORAGE_KEY);
    }
    router.push(nextHref);
  };

  return (
    <div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_#1c1a17_0%,_#050505_100%)] pointer-events-none" />

      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-[1500ms] ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
      >
        <div
          ref={letterRef}
          className="relative w-full max-w-[500px] bg-[#efebe4] flex flex-col items-center shadow-[0_20px_70px_-10px_rgba(0,0,0,0.9)] overflow-hidden"
          style={{
            borderRadius: '2px',
            padding: '4rem 3rem 5rem 3rem',
            minHeight: '680px',
          }}
        >
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(90deg,transparent_49%,rgba(0,0,0,0.08)_50%,transparent_51%)]" />
          <div className="absolute inset-0 pointer-events-none opacity-60 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.4)_50%,transparent_52%)] mix-blend-soft-light" />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(100,80,60,0.15)]" />

          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 w-full z-10">
            <div className="absolute top-12 right-8 opacity-90 mix-blend-multiply pointer-events-none" style={{ filter: 'sepia(0.6) contrast(0.9) saturate(0.8)' }}>
              <svg width="100" height="180" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M48 180C48 180 52 120 45 60" stroke="#756a5d" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M46 130C46 130 65 125 70 110" stroke="#756a5d" strokeWidth="1" strokeLinecap="round" />
                <path d="M70 110C72 108 65 115 62 120" fill="#8c7f70" opacity="0.6" />
                <path d="M47 90C47 90 25 85 20 70" stroke="#756a5d" strokeWidth="1" strokeLinecap="round" />
                <path d="M20 70C18 68 25 75 28 80" fill="#8c7f70" opacity="0.6" />
                <path d="M45 60C38 55 35 40 45 35C55 30 60 45 55 55" fill="#9e8c7e" opacity="0.7" />
                <path d="M45 60L42 50M55 55L58 45" stroke="#756a5d" strokeWidth="0.5" />
              </svg>
            </div>

            <header className="space-y-6 w-full flex flex-col items-center">
              <span className="ink-text text-[10px] uppercase tracking-[0.3em] text-[#786c5e] font-semibold opacity-70">Private Correspondence</span>

              <div className="w-full text-left pl-4 sm:pl-8 opacity-90">
                <span className="ink-text font-serif italic text-[#5c534b] text-xl mix-blend-multiply">Dearest {letterData.to},</span>
              </div>
            </header>

            <main className="space-y-8 flex flex-col items-center w-full">
              <div className="relative px-2">
                <p className="ink-text text-[#2b2620] text-2xl sm:text-3xl font-serif italic leading-[1.7] max-w-[340px] mix-blend-multiply opacity-90">
                  {letterData.closingLine}
                </p>
              </div>

              {letterData.dedication ? (
                <div className="flex flex-col items-center space-y-6 w-full px-8">
                  <div className="w-8 h-[1px] bg-[#9c9183]" />
                  <p className="ink-text text-[#5c534b] text-sm sm:text-base font-serif italic tracking-wide leading-relaxed mix-blend-multiply opacity-80">
                    {letterData.dedication}
                  </p>
                </div>
              ) : null}

              <div className="w-full text-right pr-6 sm:pr-10 pt-2 opacity-90">
                <span className="ink-text font-serif italic text-[#5c534b] text-lg mix-blend-multiply leading-relaxed">
                  Yours,
                  <br />
                  <span className="text-xl">{letterData.from}</span>
                </span>
              </div>
            </main>
          </div>

          <footer className="mt-16 flex flex-col items-center w-full relative z-10">
            <div className="relative mb-10 group transition-transform duration-700">
              <div
                className="wax-seal-outer w-16 h-16 rounded-[48%_52%_55%_45%] flex items-center justify-center transition-all duration-1000"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #7a1f1f, #4a0e0e)',
                  boxShadow: '1px 3px 6px rgba(0,0,0,0.4), inset -1px -1px 4px rgba(0,0,0,0.6)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center border border-black/20"
                  style={{
                    background: 'linear-gradient(135deg, #661818, #4d1010)',
                    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5), 1px 1px 1px rgba(255,255,255,0.05)',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70 mix-blend-overlay">
                    <path d="M17 7L7 17M7 7L17 17" stroke="black" strokeWidth="3" strokeLinecap="square" />
                    <path d="M17 7L7 17M7 7L17 17" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="square" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-between items-end px-4 border-t border-[#d6cec3] pt-4">
              <span className="text-[11px] font-serif italic text-[#8c8276]">Exsoverse</span>
              <span className="text-[10px] font-mono text-[#8c8276] tracking-tight">{letterData.date}</span>
            </div>
          </footer>
        </div>

        <div
          data-html2canvas-ignore="true"
          className={`mt-12 flex flex-col items-center space-y-6 transition-opacity duration-1000 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <button
            type="button"
            onClick={handleSaveSnapshot}
            disabled={isSaving}
            className="btn-tertiary group relative flex items-center space-x-3 px-6 py-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#8c8276] group-hover:text-[#d6cec3] transition-colors"
            >
              <path d="M4 8H7L9 5H15L17 8H20V19H4V8Z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8c8276] group-hover:text-[#d6cec3] transition-colors">
              {isSaving ? 'Preserving...' : 'Keep this memory'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCloseBook}
            className="btn-tertiary text-[10px]"
          >
            Close Book
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,200;0,400;0,600;1,200;1,400;1,500&family=JetBrains+Mono:wght@100&display=swap');

          .font-serif {
            font-family: 'Crimson Pro', serif;
          }

          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }
        `,
        }}
      />
    </div>
  );
}

export default function ExsoEndPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090a] flex items-center justify-center p-4"></div>}>
      <ExsoEndContent />
    </Suspense>
  );
}
