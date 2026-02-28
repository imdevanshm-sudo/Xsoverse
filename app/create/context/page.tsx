"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useExsoDraft } from "../../../lib/exsoDraft";

const MAX_LETTER_TEXT = 320;
type LetterChoice = "with_letter" | "without_letter" | null;

export default function LetterContextPage() {
  const router = useRouter();
  const { draft, setDraft } = useExsoDraft();
  const [receiverName, setReceiverName] = useState(draft.receiverName ?? "");
  const [letterText, setLetterText] = useState(draft.context ?? "");
  const [letterChoice, setLetterChoice] = useState<LetterChoice>(() => {
    if (draft.showLetterOnEnd === true) return "with_letter";
    if (draft.showLetterOnEnd === false) return "without_letter";
    return null;
  });

  useEffect(() => {
    if (!draft.type || !draft.identity) {
      router.replace("/xso/quiet");
    }
  }, [router, draft.type, draft.identity]);

  const showLetterOnEnd = letterChoice === "with_letter";
  const isValid = useMemo(() => {
    if (letterChoice === null) return false;
    if (!showLetterOnEnd) return true;
    return receiverName.trim().length > 0 && letterText.trim().length > 0;
  }, [letterChoice, receiverName, letterText, showLetterOnEnd]);

  const handleContinue = () => {
    if (!isValid) return;
    setDraft({
      ...draft,
      receiverName: showLetterOnEnd ? receiverName.trim() : undefined,
      context: showLetterOnEnd ? letterText.trim() : undefined,
      showLetterOnEnd,
    });
    router.push("/create/weight");
  };

  return (
    <div className="min-h-screen w-full font-serif text-ink-charcoal antialiased selection:bg-stone-300 selection:text-black bg-ritual-gradient flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center w-full px-6 py-12">
        <section className="w-full max-w-xl rounded-[20px] border border-stone-200/70 bg-white/70 p-6 md:p-8 shadow-[0_18px_36px_rgba(40,40,40,0.08)] backdrop-blur-sm">
          <header className="space-y-3 text-center">
            <h1 className="text-[28px] md:text-[32px] leading-snug font-medium text-[#4b4a46]">
              Shape the letter ending
            </h1>
            <p className="text-[14px] md:text-[15px] text-ink-charcoal/70 leading-relaxed">
              Choose if you want to include the ending letter screen.
            </p>
          </header>

          <div className="mt-8 space-y-6">
            <div className="space-y-3 rounded-xl border border-stone-200 bg-[#f7f4ee] p-4">
              <p className="text-[13px] uppercase tracking-[0.18em] text-[#7a756c]">Letter choice</p>
              <p className="text-[13px] text-[#5d5951]">
                Show the letter page after <span className="italic">Reply with an XSO</span> or <span className="italic">Exit XSO</span>.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLetterChoice("with_letter")}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    showLetterOnEnd
                      ? "border-stone-400 bg-white text-[#2f2d29]"
                      : "border-stone-200 bg-transparent text-[#7a756c]"
                  }`}
                >
                  Include ending letter
                </button>
                <button
                  type="button"
                  onClick={() => setLetterChoice("without_letter")}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    letterChoice === "without_letter"
                      ? "border-stone-400 bg-white text-[#2f2d29]"
                      : "border-stone-200 bg-transparent text-[#7a756c]"
                  }`}
                >
                  Skip ending letter
                </button>
              </div>
            </div>

            {showLetterOnEnd ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="receiver-name" className="text-[13px] uppercase tracking-[0.18em] text-[#7a756c]">
                    Receiver name
                  </label>
                  <input
                    id="receiver-name"
                    type="text"
                    value={receiverName}
                    onChange={(event) => setReceiverName(event.target.value)}
                    placeholder="Who is this for?"
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-[16px] text-[#2f2d29] outline-none transition-colors focus:border-stone-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="letter-text" className="text-[13px] uppercase tracking-[0.18em] text-[#7a756c]">
                      Letter text
                    </label>
                    <span className="text-[11px] text-[#8a857c]">
                      {letterText.length}/{MAX_LETTER_TEXT}
                    </span>
                  </div>
                  <textarea
                    id="letter-text"
                    value={letterText}
                    onChange={(event) => setLetterText(event.target.value.slice(0, MAX_LETTER_TEXT))}
                    placeholder="Write the line you want reflected in the letter page."
                    className="h-36 w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-[16px] leading-relaxed text-[#2f2d29] outline-none transition-colors focus:border-stone-400"
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!isValid}
              className="btn-secondary w-full"
            >
              Save details and continue
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
