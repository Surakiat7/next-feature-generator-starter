"use client";

import { animate } from "animejs";
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

    const ring = root.querySelector<SVGElement>("[data-ring]");
    const rotator = root.querySelector<SVGGElement>("[data-rotator]");
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
    <div className="pointer-events-none col-start-1 row-start-1 h-[100vmin] w-[100vmin]">
      <svg
        ref={rootRef}
        viewBox="0 0 640 640"
        className="h-full w-full opacity-30 dark:opacity-40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g
          className="text-emerald-600 dark:text-emerald-400"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle
            cx="320"
            cy="320"
            r="240"
            className="text-emerald-600/20 dark:text-emerald-400/20"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <circle
            cx="320"
            cy="320"
            r="160"
            className="text-emerald-600/25 dark:text-emerald-400/25"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.4"
          />
          <circle
            cx="320"
            cy="320"
            r="80"
            className="text-emerald-600/30 dark:text-emerald-400/30"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.5"
          />

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
        </g>
      </svg>
    </div>
  );
}
