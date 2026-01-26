import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="bg-[#F8F7F4] text-[#3f3f3b]">
      <div className="mx-auto flex min-h-[120vh] w-full max-w-3xl px-6 pb-40 pt-24 font-sans">
        <article className="mx-auto flex w-full max-w-[36ch] flex-col text-center">
          <header className="space-y-6">
            <h1 className="text-[24px] leading-[1.6] text-[#3f3f3b]">Pricing</h1>
            <p className="text-[15px] leading-[1.9] text-[#5b5751]">
              Xsoverse is a one-time purchase digital product.
            </p>
          </header>

          <div className="py-12">
            <p className="text-[28px] leading-[1.4] text-[#3f3f3b]">$15</p>
          </div>

          <div className="space-y-4 text-[14px] leading-[1.9] text-[#6b6761]">
            <p>The price is $15 for a one-time purchase of Xsoverse.</p>
            <p>There are no subscriptions or recurring charges.</p>
            <p>Delivery is digital with instant access after successful payment.</p>
            <p>Refunds are governed by the 14-day Refund Policy.</p>
          </div>

          <div className="mt-16">
            <Link
              href="/pay"
              className="text-[13px] text-[#8f8a82] underline underline-offset-4 opacity-70 transition-opacity duration-500 hover:opacity-90"
            >
              Continue
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
