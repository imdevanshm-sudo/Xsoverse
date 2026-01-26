"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_REVEAL_RATIO = 0.65;

const EXPERIENCE_PREFIXES = ["/create", "/xso", "/exso", "/loading", "/pay", "/payment"];
const POST_PAYMENT_ROUTES = ["/xso/ready"];

type FooterLink = {
  href: string;
  label: string;
  emphasis?: boolean;
};

const FOOTER_LINKS: FooterLink[] = [
  { href: "/how-it-works", label: "How Exso works" },
  { href: "/about", label: "About", emphasis: true },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refund Policy" },
  { href: "/contact", label: "Contact" },
];

export default function FooterReveal() {
  const pathname = usePathname();
  const isAboutRoute = pathname === "/about";
  const isExperienceRoute = useMemo(
    () => EXPERIENCE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
    [pathname]
  );
  const isPostPayment = POST_PAYMENT_ROUTES.includes(pathname);
  const [hasScrolledPast, setHasScrolledPast] = useState(false);
  const [softExitVisible, setSoftExitVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [canScroll, setCanScroll] = useState(true);
  const [aboutRestReached, setAboutRestReached] = useState(false);
  const scrollIntentCaptured = useRef(false);

  useEffect(() => {
    setHasScrolledPast(false);
    setSoftExitVisible(false);
    setFooterVisible(false);
    setCanScroll(true);
    setAboutRestReached(false);
    scrollIntentCaptured.current = false;
  }, [pathname]);

  useEffect(() => {
    if (isAboutRoute) return;
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const nextCanScroll = docHeight > window.innerHeight + 1;
      setCanScroll(nextCanScroll);
      if (!nextCanScroll) {
        setHasScrolledPast(true);
        return;
      }
      const maxScroll = Math.max(0, docHeight - window.innerHeight);
      const threshold = Math.min(window.innerHeight * FOOTER_REVEAL_RATIO, maxScroll);
      const nextHasScrolledPast = window.scrollY >= threshold;
      setHasScrolledPast(nextHasScrolledPast);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, hasScrolledPast, isAboutRoute]);

  useEffect(() => {
    if (!isAboutRoute) return;
    const target = document.querySelector('[data-about-rest-point="true"]');
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutRestReached(true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [isAboutRoute]);

  useEffect(() => {
    if (canScroll) return;
    const captureIntent = (intent: string) => {
      if (scrollIntentCaptured.current) return;
      scrollIntentCaptured.current = true;
      setHasScrolledPast(true);
    };
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) captureIntent("wheel");
    };
    const handleTouchMove = () => captureIntent("touch");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "Space", "End"].includes(event.code)) {
        captureIntent("keyboard");
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canScroll]);

  useEffect(() => {
    if (isExperienceRoute) return;
    if (!canScroll) {
      setFooterVisible(true);
    }
  }, [canScroll, isExperienceRoute]);

  useEffect(() => {
    if (isAboutRoute) return;
    if (isExperienceRoute) {
      if (!isPostPayment) {
        setSoftExitVisible(hasScrolledPast);
      }
      return;
    }
    if (hasScrolledPast) {
      setFooterVisible(true);
    }
  }, [hasScrolledPast, isExperienceRoute, isPostPayment, isAboutRoute]);

  useEffect(() => {
    if (!isPostPayment || isAboutRoute) return;
    const exitTimeout = window.setTimeout(() => {
      setSoftExitVisible(true);
    }, 1200);
    const footerTimeout = window.setTimeout(() => {
      setFooterVisible(true);
    }, 2000);
    return () => {
      window.clearTimeout(exitTimeout);
      window.clearTimeout(footerTimeout);
    };
  }, [isPostPayment, isAboutRoute]);

  useEffect(() => {
    if (!isAboutRoute) return;
    if (aboutRestReached) {
      setFooterVisible(true);
    }
  }, [aboutRestReached, isAboutRoute]);

  const handleFooterReveal = () => {
    setFooterVisible(true);
  };

  const footerContainerStyle = {
    maxHeight: "320px",
  };

  const footerContent = (
    <div
      className={`overflow-hidden transition-opacity duration-[900ms] ease-out ${
        footerVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={footerContainerStyle}
    >
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-6 pb-10 text-center">
        <p className="text-[11px] text-[#b8b6b2] opacity-70">
          Exsos are digital-only experiences. No physical goods are shipped.
        </p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[#b8b6b2]">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-opacity duration-500 ease-out ${
                link.emphasis ? "opacity-70 hover:opacity-85" : "opacity-45 hover:opacity-65"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  if (isAboutRoute) {
    return <footer className="bg-white">{footerContent}</footer>;
  }

  if (!isExperienceRoute) {
    return <footer className="bg-white">{footerContent}</footer>;
  }

  if (isExperienceRoute && !isPostPayment) {
    return null;
  }

  return (
    <footer className="bg-white">
      <div
        className={`overflow-hidden transition-opacity duration-[900ms] ease-out ${
          softExitVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "200px" }}
      >
        <div className="mx-auto w-full max-w-4xl px-6 pt-8">
          <div className="mx-auto max-w-md text-center text-[12px] leading-[1.8] text-[#b8b6b2]">
            <p>You can stay a little longer.</p>
            <p>Nothing else is required.</p>
            {!footerVisible && !isPostPayment && (
              <button
                type="button"
                onClick={handleFooterReveal}
                className="mt-4 w-full text-[12px] leading-[1.8] text-[#b8b6b2] opacity-70"
              >
                When you&apos;re ready, the rest is below.
              </button>
            )}
          </div>
        </div>
      </div>
      {footerContent}
    </footer>
  );
}
