"use client";

import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function EnergyBackground() {
  const rootRef = useRef<SVGSVGElement>(null);
  const anims = useRef<ReturnType<typeof animate>[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReduced()) return;

    const core = root.querySelector<SVGElement>("[data-core]");
    const ring = root.querySelector<SVGElement>("[data-ring]");
    const rotator = root.querySelector<SVGGElement>("[data-rotator]");
    const dots = root.querySelectorAll<SVGCircleElement>("[data-dot]");
    const wave = root.querySelector<SVGCircleElement>("[data-wave]");

    // Entrance
    anims.current.push(
      animate(root, {
        opacity: [0, 1],
        scale: [0.92, 1],
        duration: 1200,
        ease: "outExpo",
      }),
    );

    if (core) {
      anims.current.push(
        animate(core, {
          scale: [0.95, 1.15],
          duration: 2200,
          loop: true,
          alternate: true,
          ease: "inOutSine",
        }),
      );
    }

    if (ring) {
      anims.current.push(
        animate(ring, {
          opacity: [0.25, 0.55],
          duration: 3000,
          loop: true,
          alternate: true,
          ease: "inOutSine",
        }),
      );
    }

    if (rotator) {
      anims.current.push(
        animate(rotator, {
          rotate: 360,
          duration: 18000,
          loop: true,
          ease: "linear",
        }),
      );
    }

    if (dots.length) {
      anims.current.push(
        animate(dots, {
          opacity: [0.25, 0.85],
          scale: [0.9, 1.05],
          duration: 1200,
          loop: true,
          alternate: true,
          delay: stagger(80),
          ease: "inOutSine",
        }),
      );
    }

    if (wave) {
      anims.current.push(
        animate(wave, {
          scale: [0.4, 1.5],
          opacity: [0.25, 0],
          duration: 2600,
          loop: true,
          loopDelay: 800,
          ease: "outSine",
        }),
      );
    }

    return () => {
      anims.current.forEach((a) => a.pause());
      anims.current = [];
    };
  }, []);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 640 640"
      className="pointer-events-none absolute -top-8 left-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 opacity-30 dark:opacity-40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="core-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="text-emerald-600 dark:text-emerald-400" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx="320" cy="320" r="240" className="text-zinc-200/50 dark:text-zinc-800/50" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <circle cx="320" cy="320" r="160" className="text-zinc-200/50 dark:text-zinc-800/50" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <circle cx="320" cy="320" r="80" className="text-zinc-200/50 dark:text-zinc-800/50" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />

        <circle
          data-wave
          cx="320"
          cy="320"
          r="120"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.25"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />

        <g data-rotator style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle
            cx="320"
            cy="320"
            r="220"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="20 180"
            strokeLinecap="round"
            opacity="0.35"
          />
          <circle
            cx="320"
            cy="320"
            r="200"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="120 280"
            strokeLinecap="round"
            opacity="0.2"
          />
        </g>

        <g className="text-emerald-500 dark:text-emerald-400">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const x = 320 + 220 * Math.cos(angle);
            const y = 320 + 220 * Math.sin(angle);
            return (
              <circle
                key={i}
                data-dot
                cx={x}
                cy={y}
                r="2.5"
                fill="currentColor"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            );
          })}
        </g>

        <circle
          data-ring
          cx="320"
          cy="320"
          r="240"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.25"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />

        <g style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="320" cy="320" r="28" fill="url(#core-glow)" />
          <circle
            data-core
            cx="320"
            cy="320"
            r="8"
            fill="currentColor"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        </g>
      </g>
    </svg>
  );
}
