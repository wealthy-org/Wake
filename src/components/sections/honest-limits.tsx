"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export function HonestLimits() {
  const limits = [
    {
      id: "01",
      title: "Pons V2 curve and v4 pool coverage only",
      description:
        "Wake currently covers only the Pons V2 curve and its v4 pools.",
    },
    {
      id: "02",
      title: "Interpolated block timestamps",
      description:
        "Block time is interpolated.",
    },
    {
      id: "03",
      title: "Router identity confidence on v4 pools",
      description:
        "Wallet identity on v4 pools can sometimes be a router, so confidence may be low.",
    },
    {
      id: "04",
      title: "External data availability",
      description:
        "External data is only available in Live mode.",
    },
    {
      id: "05",
      title: "Model verdicts & disclaimer",
      description:
        "Verdicts are model outputs, not financial advice or recommendations.",
    },
  ];

  return (
    <section
      id="limits"
      aria-label="Honest Limits"
      className="w-full py-16 sm:py-24 px-5 sm:px-8 border-b border-zinc-200/80 bg-white"
    >
      <div className="max-w-[900px] mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 mb-3">
            <AlertCircle className="size-3 text-zinc-600" />
            <span>TRANSPARENCY & CONSTRAINTS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-950 font-sans mb-3 text-balance">
            Honest limits
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed text-balance">
            Technical boundaries, coverage limits, and behavioral constraints of the current software.
          </p>
        </div>

        {/* Clean, Restrained Technical List (Deliberately NOT generic cards) */}
        <div className="border border-zinc-300 rounded-lg bg-[#fafaf9] divide-y divide-zinc-200 shadow-2xs font-mono text-xs sm:text-sm">
          {limits.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4 transition-colors hover:bg-white"
            >
              <div className="shrink-0">
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold text-zinc-700 bg-zinc-200/80 rounded border border-zinc-300/60">
                  LIMIT {item.id}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-zinc-900 font-semibold mb-1">
                  {item.title}
                </p>
                <p className="text-zinc-600 font-normal leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Subdued Transparency Note */}
        <p className="mt-4 text-[11px] font-mono text-zinc-500 leading-relaxed">
          Wake discloses coverage bounds directly in the UI during execution. Distance between graph nodes is a force-directed layout mechanism and must not be interpreted as physical or analytical proximity.
        </p>
      </div>
    </section>
  );
}
