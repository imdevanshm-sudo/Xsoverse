import AboutSection from "../about/AboutSection";

export default function TermsPage() {
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl px-6 pb-32 pt-20 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col text-center">
          <AboutSection className="space-y-6">
            <header>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
                Terms
              </p>
              <h1 className="mt-6 text-[26px] leading-[1.5] text-[#3f3f3b]">
                Terms of Service
              </h1>
            </header>
          </AboutSection>

          <AboutSection className="mt-12 space-y-4 text-[15px] leading-[1.9] text-[#5b5751]">
            <p>Exso provides digital experiences created after purchase.</p>
            <p>
              By using Exso, you agree not to misuse the service or attempt to access
              Exsos not intended for you.
            </p>
            <p>Exsos are provided “as is” for personal use.</p>
          </AboutSection>
        </article>
      </div>
    </div>
  );
}
