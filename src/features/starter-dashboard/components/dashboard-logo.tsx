"use client";

import { animate } from "animejs";
import { useEffect, useRef } from "react";

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function DashboardLogo() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || prefersReduced()) return;

    const rotator = svg.querySelector<SVGGElement>("[data-rotator]");
    const core = svg.querySelector<SVGCircleElement>("[data-core]");

    const anims: ReturnType<typeof animate>[] = [];

    if (rotator) {
      anims.push(
        animate(rotator, {
          rotate: 360,
          duration: 12000,
          loop: true,
          ease: "linear",
        }),
      );
    }

    if (core) {
      anims.push(
        animate(core, {
          scale: [0.9, 1.2],
          duration: 1800,
          loop: true,
          alternate: true,
          ease: "inOutSine",
        }),
      );
    }

    return () => anims.forEach((a) => a.pause());
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 40 40"
      className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
      fill="none"
      aria-hidden="true"
    >
      <g data-rotator style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle
          cx="20"
          cy="20"
          r="15"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="10 25"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>
      <circle
        data-core
        cx="20"
        cy="20"
        r="4"
        fill="currentColor"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    </svg>
  );
}
