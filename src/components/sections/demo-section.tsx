"use client";

import React from "react";
import { ObservationDemo } from "@/components/network";
import { Film } from "lucide-react";

export function DemoSection() {
  return (
    <section
      id="demo"
      aria-label="Application Demo"
      className="w-full py-16 sm:py-24 px-5 sm:px-8 border-b border-zinc-200/80 bg-white"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 mb-3">
            <Film className="size-3 text-zinc-600" />
            <span>RECORDED OBSERVATION REPLAY</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-950 font-sans mb-3 text-balance">
            Demo
          </h2>
          {/* MANDATORY SUPPORTING COPY */}
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed text-balance">
            Explore a recorded Wake sample. Follow wallet activity, inspect token flows, and open the history behind each observed relationship.
          </p>
        </div>

        {/* INTERACTIVE 2D OBSERVATION CANVAS */}
        <ObservationDemo />

        {/* Local Software Documentation Footnote */}
        <div className="mt-4 px-2 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>This demo replays a self-contained recorded sample on client memory. Zero RPC calls · Zero external network traffic.</span>
          <span className="text-zinc-400">Wake Terminal Demo v0.1</span>
        </div>
      </div>
    </section>
  );
}
