'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const EXSOS = [
  {
    id: 'quiet',
    title: 'Quiet Presence',
    subtitle: 'To let them know you are simply there.',
    bgClass: 'bg-[#ECECEE]',
    isActive: true,
  },
  {
    id: 'anchor',
    title: 'The Anchor',
    subtitle: 'For grounding when things feel unmoored.',
    bgClass: 'bg-[#E8ECE9]',
    isActive: false,
  },
  {
    id: 'light',
    title: 'A Soft Light',
    subtitle: 'To hold space for their shadows.',
    bgClass: 'bg-[#EFEBE9]',
    isActive: false,
  },
];

export default function HomePage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  const cardMargins = ['mb-[18px]', 'mb-[22px]', 'mb-[16px]'];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-slate-800">
      <div className="flex min-h-screen w-full flex-col items-center justify-center py-10">
        <div className="mx-auto max-w-[420px] px-6 text-center font-serif">
          <div className={visible ? 'opacity-100' : 'opacity-0'}>
            <div className="mb-20 mt-10">
              <h1 className="text-[23px] font-normal leading-[1.45] text-[#63a0bf]">
                For the words that haven&apos;t found their way.
              </h1>
              <p className="mt-4 italic text-[12.5px] leading-[1.6] text-[#aaaaaa]">
                A space to share a feeling when the silence feels too heavy.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-6">
              {EXSOS.map((exso, index) => {
                const card = (
                  <div
                    className={`rounded-xl border border-transparent p-8 transition-opacity duration-500 ${exso.bgClass}`}
                  >
                    <div className="flex flex-col">
                      <h3 className="text-[14px] font-normal text-[#000000]">
                        {exso.title}
                      </h3>
                      <p className="mt-1 italic text-[12.5px] leading-[1.55] text-[#666666]">
                        {exso.subtitle}
                      </p>
                    </div>
                    {!exso.isActive && (
                      <div className="mt-6 opacity-40 pointer-events-none">
                        <p>Coming soon</p>
                      </div>
                    )}
                  </div>
                );

                if (!exso.isActive) {
                  return (
                    <div
                      key={exso.id}
                      className={`block w-full max-w-[320px] ${cardMargins[index] ?? ''} opacity-40 pointer-events-none`}
                    >
                      {card}
                    </div>
                  );
                }

                return (
                  <Link
                    key={exso.id}
                    href={{ pathname: `/xso/${exso.id}` }}
                    className={`group block w-full max-w-[320px] ${cardMargins[index] ?? ''}`}
                  >
                    {card}
                  </Link>
                );
              })}
            </div>

            <p className="mt-8 text-[11px] text-[#b0b0b0]">
              Private · One-to-one · Created after purchase
            </p>

            <div className="mt-6">
              <p className="text-[11px] text-[#b0b0b0]">
                More ways to share
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
