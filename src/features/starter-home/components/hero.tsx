"use client";

import { createTimeline } from "animejs";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { paths } from "@/routes";

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const actionRef = useRef<HTMLAnchorElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const tl = useRef<ReturnType<typeof createTimeline> | null>(null);

  useEffect(() => {
    const reduce = prefersReduced();
    if (reduce) return;

    tl.current = createTimeline({ defaults: { ease: "outExpo" } });

    if (titleRef.current) {
      tl.current.add(titleRef.current, {
        opacity: [0, 1],
        translateY: [18, 0],
        letterSpacing: ["0.06em", "-0.03em"],
        duration: 900,
      });
    }
    if (descRef.current) {
      tl.current.add(
        descRef.current,
        { opacity: [0, 1], translateY: [10, 0], duration: 700 },
        300,
      );
    }
    if (actionRef.current) {
      tl.current.add(
        actionRef.current,
        { opacity: [0, 1], translateY: [8, 0], duration: 650 },
        500,
      );
    }
    if (underlineRef.current) {
      tl.current.add(
        underlineRef.current,
        { scaleX: [0, 1], opacity: [0, 1], duration: 700 },
        350,
      );
    }

    return () => {
      tl.current?.pause();
      tl.current = null;
    };
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-6 py-24 text-center">
      <h1
        ref={titleRef}
        className="max-w-4xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl"
      >
        Next Feature Starter
      </h1>
      <div
        ref={underlineRef}
        className="mt-4 h-px w-24 origin-center bg-emerald-500/60 dark:bg-emerald-400/60"
      />
      <p
        ref={descRef}
        className="mt-5 max-w-md text-sm text-zinc-500 dark:text-zinc-400"
      >
        Feature-based Next.js starter with built-in code generation.
      </p>
      <Link
        ref={actionRef}
        href={paths.starterDashboard}
        className="mt-8 inline-flex items-center gap-1.5 rounded-md border border-zinc-300/80 bg-white/80 px-3 py-2 font-mono text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
      >
        <span aria-hidden className="font-mono text-emerald-600 dark:text-emerald-400">
          →
        </span>
        View Starter Guide
      </Link>
    </div>
  );
}
