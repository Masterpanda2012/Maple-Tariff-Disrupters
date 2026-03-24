"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type RevealVariant = "up" | "scale" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay after the element enters the viewport (ms). */
  delayMs?: number;
  /** Motion style when becoming visible. */
  variant?: RevealVariant;
};

const variantClasses: Record<
  RevealVariant,
  { visible: string; hidden: string }
> = {
  up: {
    visible: "translate-y-0 opacity-100",
    hidden: "translate-y-8 opacity-0",
  },
  scale: {
    visible: "scale-100 opacity-100",
    hidden: "scale-[0.96] opacity-0",
  },
  left: {
    visible: "translate-x-0 opacity-100",
    hidden: "-translate-x-6 opacity-0",
  },
  right: {
    visible: "translate-x-0 opacity-100",
    hidden: "translate-x-6 opacity-0",
  },
};

/**
 * Fades and moves content in when it crosses into the viewport (respects reduced motion).
 */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const v = variantClasses[variant];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${visible ? v.visible : v.hidden} ${className}`}
      style={{
        transitionDelay: visible ? `${delayMs}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
