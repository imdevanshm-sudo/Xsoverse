import AboutSection from "../about/AboutSection";

export default function PrivacyPage() {
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl px-6 pb-32 pt-20 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col text-center">
          <AboutSection className="space-y-6">
            <header>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
                Privacy
              </p>
              <h1 className="mt-6 text-[26px] leading-[1.5] text-[#3f3f3b]">
                Privacy Policy
              </h1>
            </header>
          </AboutSection>

          <AboutSection className="mt-12 space-y-4 text-[15px] leading-[1.9] text-[#5b5751]">
            <p>
              Xsoverse collects the minimum personal data required to process payments
              and provide access.
            </p>
            <p>Payment data is handled by third-party payment processors.</p>
            <p>Personal data is not sold.</p>
          </AboutSection>
        </article>
      </div>
    </div>
  );
}
