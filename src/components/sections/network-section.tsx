"use client";

import React from "react";
import { NetworkTerminal } from "@/components/network";
import { Badge } from "@/components/ui/badge";

export function NetworkSection() {
  return (
    <section
      id="network-demo"
      aria-label="Wake Network Observation Terminal Demo"
      className="relative w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 border-t border-zinc-200/60 bg-[#f7f7f5] overflow-hidden"
    >
      {/* Background Subtle Technical Grid Accent */}
      <div
        className="pointer-events-none absolute inset-0 wake-grid-pattern opacity-60 select-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1240px] mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          {/* Eyebrow Badge */}
          <Badge
            variant="outline"
            className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-zinc-500 uppercase px-3 py-1 border-zinc-300/80 bg-white/90 shadow-2xs mb-3.5 rounded-full"
          >
            INTERACTIVE REPLAY
          </Badge>

          {/* Main Section Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-zinc-950 font-sans mb-3 text-balance">
            See the rotation, <br className="hidden sm:inline" />
            <span className="text-zinc-500 font-normal">then inspect the proof.</span>
          </h2>

          {/* Subtitle strictly maintaining observational language */}
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed text-balance">
            Wake observes when a wallet sells Token A, then buys Token B within a defined time window.
            Select any observed rotation or wallet node to examine raw on-chain transaction evidence.
          </p>
        </div>

        {/* Network Terminal Container */}
        <div className="w-full">
          <NetworkTerminal />
        </div>
      </div>
    </section>
  );
}
