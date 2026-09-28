"use client";

import React from "react";
import { ArrowDown, Play, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroNetwork } from "@/components/sections/hero-network";

export function Hero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="hero"
      aria-label="Product Introduction"
      className="relative w-full min-h-[calc(100svh-4rem)] flex flex-col justify-center items-center overflow-hidden wake-grid-pattern px-5 sm:px-8 py-10 sm:py-16 md:py-20 border-b border-zinc-200/80"
    >
      {/* Background radial gradient mask */}
      <div
        className="pointer-events-none absolute inset-0 wake-ambient-radial wake-grid-mask select-none"
        aria-hidden="true"
      />

      {/* Ambient on-chain observation network sitting behind documentation */}
      <HeroNetwork />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* REFINED LOCAL RUNTIME STATUS PANEL */}
        <div
          role="status"
          aria-label="Local Runtime Status"
          className="w-full max-w-2xl border border-zinc-200/90 bg-white/95 rounded-lg p-3 sm:py-2.5 sm:px-4 text-left shadow-2xs mb-6 sm:mb-8"
        >
          {/* Header & Localhost Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-zinc-800 uppercase">
                LOCAL INSTANCE
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 border border-zinc-200/80 px-1.5 py-0.5 rounded tracking-tight select-all">
              127.0.0.1
            </span>
          </div>

          {/* Primary & Supporting Message */}
          <div className="mt-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 leading-relaxed">
            <span className="text-xs sm:text-[13px] font-mono font-semibold text-zinc-950 shrink-0">
              Wake runs on your machine.
            </span>
            <span className="text-xs sm:text-[12px] text-zinc-600 font-mono">
              The web interface is served locally through localhost.
            </span>
          </div>

          {/* Technical Status Metadata Row */}
          <div className="mt-2 pt-1.5 border-t border-zinc-100 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
            <span>Documentation only</span>
            <span className="text-zinc-300 hidden sm:inline" aria-hidden="true">·</span>
            <span>No site backend</span>
            <span className="text-zinc-300 hidden sm:inline" aria-hidden="true">·</span>
            <span>No wallet connection</span>
          </div>
        </div>

        {/* Mandatory Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-zinc-950 leading-[1.12] mb-4 sm:mb-5 text-balance">
          See where capital moves on Robinhood Chain.
        </h1>

        {/* Mandatory One Concise Explanatory Sentence */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-600 font-normal leading-relaxed max-w-2xl text-balance mb-8">
          Wake is local software that lets users observe on-chain capital movement.
        </p>

        {/* Primary and Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-8">
          <Button
            size="lg"
            onClick={() => scrollTo("install")}
            className="w-full sm:w-auto rounded-md bg-zinc-950 hover:bg-black text-white font-mono text-sm font-medium shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all h-11 px-6 cursor-pointer border border-zinc-900 flex items-center justify-center gap-2"
          >
            <Terminal className="size-4 text-zinc-400" />
            <span>Install</span>
            <ArrowDown className="size-3.5 text-zinc-400" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollTo("demo")}
            className="w-full sm:w-auto rounded-md bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-300 font-mono text-sm font-medium shadow-2xs hover:-translate-y-0.5 active:translate-y-0 transition-all h-11 px-6 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="size-3.5 fill-current text-zinc-700" />
            <span>Watch the demo</span>
          </Button>
        </div>

        {/* Technical Factual Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-mono text-zinc-500 pt-2 border-t border-zinc-200/80">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Runs locally on 127.0.0.1
          </span>
          <span className="text-zinc-300 hidden sm:inline">·</span>
          <span>No wallet connection</span>
          <span className="text-zinc-300 hidden sm:inline">·</span>
          <span>Public RPC</span>
          <span className="text-zinc-300 hidden sm:inline">·</span>
          <span>Node.js 22+</span>
        </div>
      </div>
    </section>
  );
}