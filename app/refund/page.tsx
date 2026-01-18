import AboutSection from "../about/AboutSection";

export default function RefundPage() {
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl px-6 pb-32 pt-20 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col text-center">
          <AboutSection className="space-y-6">
            <header>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
                Refunds
              </p>
              <h1 className="mt-6 text-[26px] leading-[1.5] text-[#3f3f3b]">
                Refund Policy
              </h1>
            </header>
          </AboutSection>

          <AboutSection className="mt-12 space-y-4 text-[15px] leading-[1.9] text-[#5b5751]">
            <p>Due to the personalized and digital nature of Exsos, all sales are generally final.</p>
            <p>
              If you experience a technical issue or did not receive your Exso as intended,
              please contact us and we will review the request on a case-by-case basis.
            </p>
          </AboutSection>
        </article>
      </div>
    </div>
  );
}
