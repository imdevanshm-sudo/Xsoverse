export default function PaymentPage() {
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col text-center">
          <header className="space-y-6">
            <h1 className="text-[24px] leading-[1.6] text-[#3f3f3b]">The price</h1>
            <p className="text-[15px] leading-[1.9] text-[#5b5751]">
              A single price, held without explanation.
            </p>
          </header>

          <div className="py-12">
            <p className="text-[28px] leading-[1.4] text-[#3f3f3b]">$15</p>
          </div>

          <div className="mt-16">
            <a
              href="/payment/notice"
              className="text-[13px] text-[#8f8a82] underline underline-offset-4 opacity-70 transition-opacity duration-500 hover:opacity-90"
            >
              Continue
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
