"use client";

import { useEffect, useRef, useState } from "react";

type AboutSectionProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
};

export default function AboutSection({ children, className, ...rest }: AboutSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      data-visible={isVisible}
      className={`about-section ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </section>
  );
}
