"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ExsoWeight } from "../../../lib/exsoFlow";
import { useExsoDraft } from "../../../lib/exsoDraft";

const OPTIONS: Array<{
  id: ExsoWeight;
  title: string;
  description: ReactNode;
}> = [
  {
    id: "quiet",
    title: "Quiet",
    description: (
      <>
        Leaves a trace, <br />
        without asking <br />
        to be held.
      </>
    ),
  },
  {
    id: "present",
    title: "Present",
    description: (
      <>
        Says enough to <br />
        be felt, without <br />
        asking for more.
      </>
    ),
  },
  {
    id: "held",
    title: "Held",
    description: (
      <>
        Acknowledges <br />
        what isn’t <br />
        being said.
      </>
    ),
  },
];

export default function WeightSelectionPage() {
  const router = useRouter();
  const { draft, setDraft } = useExsoDraft();

  useEffect(() => {
    if (!draft.type || !draft.identity) {
      router.replace("/xso/quiet");
      return;
    }
    if (draft.showLetterOnEnd && (!draft.receiverName || !draft.context)) {
      router.replace("/create/context");
    }
  }, [router, draft.type, draft.identity, draft.receiverName, draft.context, draft.showLetterOnEnd]);

  const onSelectWeight = (weight: ExsoWeight) => {
    setDraft({
      ...draft,
      weight,
    });
    router.push("/pay");
  };

  return (
    <div className="min-h-screen w-full font-serif text-ink-charcoal antialiased selection:bg-stone-300 selection:text-black bg-ritual-gradient flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center w-full px-4 py-12 md:py-16">
        <header className="text-center mb-12 md:mb-20 space-y-3 w-full max-w-lg mx-auto">
          <h1 className="text-[28px] md:text-[32px] leading-snug font-medium text-[#4b4a46]">
            How present should this be?
          </h1>
        </header>

        <section
          aria-label="Selection Options"
          className="w-full max-w-md md:max-w-4xl mx-auto flex flex-col md:flex-row gap-6 px-2 md:px-6 justify-center items-stretch"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectWeight(option.id)}
              className="relative flex flex-col items-center justify-center text-center w-full md:flex-1 min-h-[300px] md:min-h-[340px] p-6 rounded-[16px] transition-opacity duration-700 ease-out border bg-white border-stone-100/50 shadow-[0_10px_28px_rgba(51,51,51,0.12)] hover:border-stone-200 hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2efe8]"
            >
              <h3 className="text-[22px] md:text-[24px] mb-4 font-medium transition-colors duration-300 text-[#333]">
                {option.title}
              </h3>
              <div className="text-[16px] md:text-[18px] leading-[1.5] transition-colors duration-300 font-normal text-[#333]/90">
                {option.description}
              </div>
              <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.2em] text-[#5e5a53]">
                {`Choose ${option.title}`}
              </p>
            </button>
          ))}
        </section>
      </main>

      <footer className="w-full text-center py-8 px-6 mb-4 md:mb-8">
        <p className="text-[13px] md:text-[14px] text-ink-charcoal/60 font-medium tracking-wide">
          There’s no right choice. Only what feels accurate.
        </p>
      </footer>
    </div>
  );
}
