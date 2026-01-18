import AboutSection from "../about/AboutSection";

export default function ContactPage() {
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl px-6 pb-32 pt-20 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col text-center">
          <AboutSection className="space-y-6">
            <header>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
                Contact
              </p>
              <h1 className="mt-6 text-[26px] leading-[1.5] text-[#3f3f3b]">
                Contact
              </h1>
            </header>
          </AboutSection>

          <AboutSection className="mt-12 space-y-4 text-[15px] leading-[1.9] text-[#5b5751]">
            <p>If you need help, please reply to your order confirmation email.</p>
            <p>
              Include any details you have about the Exso so we can review your request
              quickly.
            </p>
          </AboutSection>
        </article>
      </div>
    </div>
  );
}
