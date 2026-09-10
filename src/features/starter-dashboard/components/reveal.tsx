"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

/**
 * Fade-and-rise a block into view on scroll with anime.js. Starts hidden
 * (server-rendered with opacity 0 to avoid a flash) and reveals once it enters
 * the viewport. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  y = 20,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.style.opacity = "1";
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          animate(el, {
            opacity: [0, 1],
            translateY: [y, 0],
            duration: 700,
            delay,
            ease: "outExpo",
          });
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [y, delay]);

  return (
    <div ref={ref} style={{ opacity: 0 }} className={className}>
      {children}
    </div>
  );
}
