import AboutSection from "../about/AboutSection";

export default function HowItWorksPage() {
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl px-6 pb-32 pt-20 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col text-center">
          <AboutSection className="space-y-6">
            <header>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
                How Exso works
              </p>
              <h1 className="mt-6 text-[26px] leading-[1.5] text-[#3f3f3b]">
                For the words that haven&apos;t found their way.
              </h1>
              <p className="mt-6 text-[15px] leading-[1.9] text-[#5b5751]">
                Exso creates private digital experiences for moments that are difficult to
                express directly.
              </p>
              <div className="mt-6 space-y-3 text-[15px] leading-[1.9] text-[#5b5751]">
                <p>
                  Each Exso is a one-time, intentional ritual — created after purchase and
                  shared privately with one person.
                </p>
                <p>No public posts. No timelines. Just presence.</p>
              </div>
            </header>
          </AboutSection>

          <AboutSection className="mt-20 space-y-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
              How Exso works
            </h2>
            <ol className="space-y-6 text-[15px] leading-[1.9] text-[#5b5751]">
              <li>
                <p className="text-[#3f3f3b]">1. Choose an Exso</p>
                <p>Select the type of experience you want to create.</p>
              </li>
              <li>
                <p className="text-[#3f3f3b]">2. Choose how you show up</p>
                <p>
                  With my name, silence page, about the message, or about you page.
                </p>
              </li>
              <li>
                <p className="text-[#3f3f3b]">3. Choose its tone</p>
                <p>
                  Quiet, Present, or Held — each carries a different emotional weight.
                </p>
              </li>
              <li>
                <p className="text-[#3f3f3b]">4. Complete payment</p>
                <p>Exsos are digital and created after purchase.</p>
              </li>
              <li>
                <p className="text-[#3f3f3b]">5. Share privately</p>
                <p>
                  Your Exso is delivered via a private link. Only the intended recipient
                  can access it.
                </p>
              </li>
            </ol>
          </AboutSection>

          <AboutSection className="mt-20 space-y-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
              About Exso
            </h2>
            <div className="space-y-4 text-[15px] leading-[1.9] text-[#5b5751]">
              <p>
                Exso is an early-stage independent project exploring new ways to
                communicate emotion digitally.
              </p>
              <p>
                It was created for moments where words feel insufficient — not to replace
                conversation, but to hold space for it.
              </p>
              <p>
                Exso is currently in a private launch phase and focused on international
                users.
              </p>
              <p className="text-[#6b6761]">
                Built in India. Designed for a global audience.
              </p>
            </div>
          </AboutSection>

          <AboutSection className="mt-20 space-y-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
              Privacy
            </h2>
            <div className="space-y-4 text-[15px] leading-[1.9] text-[#5b5751]">
              <p>Exso respects your privacy.</p>
              <p>We do not sell or share personal data.</p>
              <p>
                Payment details are processed securely by our payment provider. Exso does
                not store card information.
              </p>
              <p>
                Exsos are private by design and accessible only via the generated link.
              </p>
            </div>
          </AboutSection>
        </article>
      </div>
    </div>
  );
}
