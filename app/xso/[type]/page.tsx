'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useExsoDraft } from '../../../lib/exsoDraft';

type Step = 'presence' | 'name' | 'reassure';

export default function XsoSetupFlow() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const replyTo = searchParams.get('replyTo');
  const { draft, setDraft } = useExsoDraft();
  const exsoType = Array.isArray(params?.type) ? params.type[0] : params?.type;
  const [step, setStep] = useState<Step>('presence');
  const [aboutSelection, setAboutSelection] = useState<'message' | 'me'>(() =>
    exsoType === 'quiet' ? 'message' : 'me'
  );
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const isNameValid = aboutSelection === 'message' || name.trim().length > 0;

  useEffect(() => {
    const nextType = replyTo ? 'reply_exso' : 'thinking_of_you';
    const replyToValue = replyTo ?? undefined;
    if (draft.type === nextType && draft.replyToExsoId === replyToValue) {
      return;
    }
    setDraft({
      ...draft,
      type: nextType,
      replyToExsoId: replyToValue,
    });
  }, [replyTo, draft, setDraft]);

  const stepStyle = useMemo(() => {
    if (step === 'presence') {
      return 'bg-[#D4D3CD] font-serif text-[#222220]';
    }
    if (step === 'name') {
      return 'bg-[#F7F8FA] font-sans text-gray-800';
    }
    return 'bg-soft-cream font-sans text-gray-700';
  }, [step]);

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-700 ${stepStyle}`}>
      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-12">
        <StepPanel isActive={step === 'presence'}>
          <main className="w-full space-y-12 text-center">
            <header className="space-y-4 px-2">
              <p className="text-sm italic text-[#222220]/60">
                There is no right way to be present.
              </p>
              <h1 className="text-[26px] font-medium leading-[1.2] tracking-[-0.5px]">
                Would you like to be known, or let the message stand alone?
              </h1>
            </header>

            <section className="grid w-full grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setIsAnonymous(false);
                  setDraft({
                    ...draft,
                    identity: 'named',
                    senderName: name.trim() || undefined,
                  });
                  setAboutSelection('me');
                  setStep('name');
                }}
                className="rounded-[20px] bg-[#F2F2F0] p-6 text-center text-[14px] font-normal text-[#6a665f] shadow-sm transition-opacity duration-500 hover:opacity-80"
              >
                With my name
              </button>
              <button
                onClick={() => {
                  setIsAnonymous(true);
                  setDraft({
                    ...draft,
                    identity: 'anonymous',
                    senderName: undefined,
                  });
                  setAboutSelection('message');
                  setStep('name');
                }}
                className="rounded-[20px] bg-[#F2F2F0] p-6 text-center text-[14px] font-normal text-[#6a665f] shadow-sm transition-opacity duration-500 hover:opacity-80"
              >
                In silence
              </button>
            </section>
          </main>
        </StepPanel>

        <StepPanel isActive={step === 'name'}>
          <main className="w-full px-2 pt-6">
            <section className="mb-12 text-center">
              <h2 className="text-xl font-normal leading-snug text-gray-900">
                Do you want this message to be about the message, or about you?
              </h2>
            </section>

            <section className="space-y-6">
              <button
                onClick={() => setAboutSelection('message')}
                className={`w-full rounded-3xl border p-6 text-left transition-all duration-300 ${
                  aboutSelection === 'message'
                    ? 'border-gray-200 bg-white shadow-sm'
                    : 'border-transparent bg-transparent opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">About the message</p>
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      aboutSelection === 'message' ? 'border-gray-800' : 'border-gray-300'
                    }`}
                  >
                    {aboutSelection === 'message' && (
                      <span className="h-2 w-2 rounded-full bg-gray-800" />
                    )}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setAboutSelection('me')}
                className={`w-full rounded-3xl border p-6 text-left transition-all duration-300 ${
                  aboutSelection === 'me'
                    ? 'border-gray-200 bg-white shadow-sm'
                    : 'border-transparent bg-transparent opacity-60'
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-medium text-gray-900">About me</p>
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      aboutSelection === 'me' ? 'border-gray-800' : 'border-gray-300'
                    }`}
                  >
                    {aboutSelection === 'me' && (
                      <span className="h-2 w-2 rounded-full bg-gray-800" />
                    )}
                  </span>
                </div>
                <div
                  className={`flex flex-col gap-2 px-2 py-3 transition-opacity duration-300 ${
                    aboutSelection === 'me' ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-lg font-light text-gray-900 outline-none"
                  />
                </div>
                  <p className="text-[11px] italic text-gray-400">
                    This will only be seen if you choose it.
                  </p>
                </div>
              </button>
            </section>

            <div className="pt-10">
              <button
                onClick={() => {
                  if (!isNameValid) {
                    return;
                  }
                  setDraft({
                    ...draft,
                    identity: isAnonymous ? 'anonymous' : 'named',
                    senderName:
                      aboutSelection === 'me' ? name.trim() || undefined : undefined,
                  });
                  router.push('/create/weight');
                }}
                className={`w-full rounded-xl py-4 text-base font-normal transition-colors ${
                  isNameValid
                    ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    : 'cursor-not-allowed text-gray-300'
                }`}
                disabled={!isNameValid}
              >
                Continue
              </button>
            </div>
          </main>
        </StepPanel>

      </div>
    </div>
  );
}

function StepPanel({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center px-6 py-12 transition-opacity duration-700 ${
        isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {children}
    </div>
  );
}
