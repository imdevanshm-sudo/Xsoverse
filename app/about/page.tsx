import AboutSection from "./AboutSection";

export default function AboutPage() {
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl px-6 pb-32 pt-20 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col text-center">
          <AboutSection className="space-y-6">
            <header>
              <h1 className="text-[26px] leading-[1.5] text-[#3f3f3b]">
                How Exso works
              </h1>
              <p className="mt-6 text-[15px] leading-[1.9] text-[#5b5751]">
                Not everything needs to be explained quickly.
              </p>
            </header>
          </AboutSection>

          <div className="mx-auto my-16 h-10 w-px bg-[#cfcac2]/70" aria-hidden="true" />

          <AboutSection className="space-y-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
              The Invitation
            </h2>
            <p className="text-[20px] leading-[1.7] italic text-[#3f3f3b]">
              &quot;Exso creates private digital moments for words that haven't found their way.&quot;
            </p>
          </AboutSection>

          <AboutSection className="mt-20">
            <ol className="space-y-6 text-[15px] leading-[1.9] text-[#5b5751]">
              <li>Choose the experience you want to create</li>
              <li>Decide how you want to show up -- named or in silence</li>
              <li>Select the emotional weight</li>
              <li>Complete the ritual</li>
              <li>Share privately with one person</li>
            </ol>
          </AboutSection>

          <AboutSection className="mt-20 space-y-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8f8a82]">
              Privacy &amp; Intention
            </h2>
            <ul className="space-y-4 text-[14px] leading-[1.9] text-[#5b5751]">
              <li>One-to-one only</li>
              <li>No public feeds</li>
              <li>No notifications</li>
              <li>Created after purchase</li>
            </ul>
          </AboutSection>

          <AboutSection className="mt-20 space-y-10" data-about-rest-point="true">
            <p className="text-[14px] leading-[1.9] text-[#6b6761] opacity-40">
              Some things are meant to be held, not posted.
            </p>
          </AboutSection>
        </article>
      </div>
    </div>
  );
}
