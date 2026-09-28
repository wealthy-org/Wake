"use client";

import React from "react";
import { ArrowRight, ShieldCheck, FileCode } from "lucide-react";

export function WhatYouSee() {
  return (
    <section
      id="what-you-see"
      aria-label="What You See Feature Overview"
      className="w-full py-16 sm:py-24 px-5 sm:px-8 border-b border-zinc-200/80 bg-white"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 mb-3">
            <span>OBSERVATIONAL CAPABILITIES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-950 font-sans mb-3 text-balance">
            What you see
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed text-balance">
            Wake lets the user observe different aspects of on-chain capital movement across four dedicated views.
          </p>
        </div>

        {/* The 4 Features with Varied Layout Rhythm */}
        <div className="space-y-12 sm:space-y-16">

          {/* 1. INFLOW — Wide Feature Layout */}
          <div className="w-full border border-zinc-200 rounded-lg bg-[#fafaf9] overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-zinc-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Feature 01 · View
                  </span>
                  <span className="text-zinc-300">/</span>
                  <h3 className="font-mono text-base sm:text-lg font-bold text-zinc-950">
                    Inflow
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-mono text-zinc-800 font-semibold mb-1">
                  Purpose: Show ranking of tokens receiving capital.
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 font-normal max-w-2xl leading-relaxed">
                  Wake ranks tokens receiving rotation inflow from wallets that recently sold other assets on Robinhood Chain. Scores reflect observed inflow count, acceleration, and token curve stage.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200">
                  Ranking Board
                </span>
              </div>
            </div>

            {/* Placeholder Screenshot: Inflow (Wide) */}
            <div className="p-4 sm:p-6 bg-[#f4f4f2]">
              <div className="w-full rounded-md border border-zinc-300 bg-zinc-900 text-zinc-100 overflow-hidden shadow-xs">
                {/* Visual Window Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="size-2 rounded-full bg-zinc-700" />
                    <span>wake-view-inflow · 127.0.0.1:PORT</span>
                  </div>
                  {/* Visibly carries mandatory sample label */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    <span>Recorded sample, not a live market feed</span>
                  </div>
                </div>

                {/* Screenshot Placeholder Wireframe */}
                <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[220px] sm:min-h-[260px] bg-zinc-900/90 font-mono">
                  <p className="text-xs sm:text-sm font-bold text-zinc-300 mb-2">
                    [Recorded Sample Screenshot: Inflow]
                  </p>
                  <p className="text-xs text-zinc-500 max-w-md mb-6 leading-relaxed">
                    Token ranking table showing observed rotation inflow, acceleration ratio, curve progress, and verified transaction proof links.
                  </p>
                  {/* Factual Structure Schematic without fabricated data */}
                  <div className="w-full max-w-2xl border border-zinc-800 rounded bg-zinc-950/60 p-3 text-[11px] text-zinc-400 overflow-x-auto text-left">
                    <div className="grid grid-cols-6 gap-2 border-b border-zinc-800 pb-2 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                      <span>Rank</span>
                      <span className="col-span-2">Token</span>
                      <span>Inflow Wallets</span>
                      <span>Acceleration</span>
                      <span>Curve Stage</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2 py-2 border-b border-zinc-800/50 text-zinc-400">
                      <span>#1</span>
                      <span className="col-span-2 text-zinc-300">Sample Token A</span>
                      <span>[Recorded count]</span>
                      <span>[Observed ratio]</span>
                      <span className="text-zinc-500">Pons V2 Curve</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2 py-2 text-zinc-400">
                      <span>#2</span>
                      <span className="col-span-2 text-zinc-300">Sample Token B</span>
                      <span>[Recorded count]</span>
                      <span>[Observed ratio]</span>
                      <span className="text-zinc-500">Graduated (v4 pool)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. COIN FLOW — Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left description column */}
            <div className="lg:col-span-5 border border-zinc-200 rounded-lg p-6 sm:p-8 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Feature 02 · View
                  </span>
                  <span className="text-zinc-300">/</span>
                  <h3 className="font-mono text-base sm:text-lg font-bold text-zinc-950">
                    Coin Flow
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-mono text-zinc-800 font-semibold mb-2">
                  Purpose: Show the origin and destination wallets involved in token movement.
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed mb-6">
                  Coin Flow inspects a selected token to map where rotating wallets originated before entering and where they moved afterward. It separates first-time buyers from repeat traders.
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-2">
                  <ArrowRight className="size-3.5 text-zinc-400" />
                  <span>Incoming links: token origin distribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="size-3.5 text-zinc-400" />
                  <span>Outgoing links: subsequent wallet rotation targets</span>
                </div>
              </div>
            </div>

            {/* Right screenshot placeholder column */}
            <div className="lg:col-span-7 border border-zinc-200 rounded-lg bg-[#fafaf9] p-4 sm:p-6 flex flex-col justify-center">
              <div className="w-full rounded-md border border-zinc-300 bg-zinc-900 text-zinc-100 overflow-hidden shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-[11px] font-mono">
                  <span className="text-zinc-400">wake-view-coinflow · Ego Network</span>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    <span>Recorded sample, not a live market feed</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[220px] bg-zinc-900/90 font-mono">
                  <p className="text-xs sm:text-sm font-bold text-zinc-300 mb-2">
                    [Recorded Sample Screenshot: Coin Flow]
                  </p>
                  <p className="text-xs text-zinc-500 max-w-sm mb-4 leading-relaxed">
                    Visual ego-network diagram displaying origin tokens on the left, target token in center, and destination tokens on the right.
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 border border-zinc-800 rounded px-4 py-2 bg-zinc-950/60">
                    <span className="text-zinc-500">[Origin Tokens]</span>
                    <ArrowRight className="size-3 text-zinc-600" />
                    <span className="text-zinc-200 font-semibold">[Selected Token]</span>
                    <ArrowRight className="size-3 text-zinc-600" />
                    <span className="text-zinc-500">[Destination Tokens]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. NETWORK — Wide Visual Layout */}
          <div className="w-full border border-zinc-200 rounded-lg bg-[#fafaf9] overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-zinc-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Feature 03 · View
                  </span>
                  <span className="text-zinc-300">/</span>
                  <h3 className="font-mono text-base sm:text-lg font-bold text-zinc-950">
                    Network
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-mono text-zinc-800 font-semibold mb-1">
                  Purpose: Show the network relationship between wallets/tokens and the observed flow.
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 font-normal max-w-2xl leading-relaxed">
                  Network visualizes the graph of wallet movements across tokens. Line width represents unique wallets rotating between pairs; node distance is layout positioning, not an analytical fact.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200">
                  2D & 3D Force Graph
                </span>
              </div>
            </div>

            {/* Placeholder Screenshot: Network (Wide) */}
            <div className="p-4 sm:p-6 bg-[#f4f4f2]">
              <div className="w-full rounded-md border border-zinc-300 bg-zinc-900 text-zinc-100 overflow-hidden shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-[11px] font-mono">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <span>wake-view-network · Force Directed Graph</span>
                    <span className="text-zinc-600">|</span>
                    <span className="text-zinc-500">Window: 30m</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    <span>Recorded sample, not a live market feed</span>
                  </div>
                </div>

                <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[240px] sm:min-h-[280px] bg-zinc-900/90 font-mono">
                  <p className="text-xs sm:text-sm font-bold text-zinc-300 mb-2">
                    [Recorded Sample Screenshot: Network]
                  </p>
                  <p className="text-xs text-zinc-500 max-w-lg mb-6 leading-relaxed">
                    Graph canvas with interactive token nodes, rotation link vectors, and inspectable proof rows. Width = distinct wallet count.
                  </p>
                  <div className="inline-flex items-center gap-3 text-[11px] text-zinc-500 border border-zinc-800 rounded bg-zinc-950/70 px-3 py-1.5">
                    <span>• Nodes: Observed Tokens</span>
                    <span className="text-zinc-700">|</span>
                    <span>→ Edges: Rotation Links (Wallets)</span>
                    <span className="text-zinc-700">|</span>
                    <span>Note: Distance is layout, not a fact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. WATCHLIST — Asymmetric Arrangement Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left 1/3: Parameter & Purpose column */}
            <div className="lg:col-span-4 border border-zinc-200 rounded-lg p-6 sm:p-8 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Feature 04 · View
                  </span>
                  <span className="text-zinc-300">/</span>
                  <h3 className="font-mono text-base sm:text-lg font-bold text-zinc-950">
                    Watchlist
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-mono text-zinc-800 font-semibold mb-2">
                  Purpose: Allow the user to monitor selected wallets.
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed mb-6">
                  Users can track up to 20 custom wallet addresses. Watchlist shows whether monitored wallets have rotated within the active time window, executed trades without rotating, or remained idle.
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2.5 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-600">
                  <FileCode className="size-3.5 text-zinc-400" />
                  <span>Stored at: ~/.wake/watchlist.json</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Zero remote sync: completely local</span>
                </div>
              </div>
            </div>

            {/* Right 2/3: Asymmetric screenshot placeholder column */}
            <div className="lg:col-span-8 border border-zinc-200 rounded-lg bg-[#fafaf9] p-4 sm:p-6 flex flex-col justify-center">
              <div className="w-full rounded-md border border-zinc-300 bg-zinc-900 text-zinc-100 overflow-hidden shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-[11px] font-mono">
                  <span className="text-zinc-400">wake-view-watchlist · Local Wallets</span>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    <span>Recorded sample, not a live market feed</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[220px] bg-zinc-900/90 font-mono">
                  <p className="text-xs sm:text-sm font-bold text-zinc-300 mb-2">
                    [Recorded Sample Screenshot: Watchlist]
                  </p>
                  <p className="text-xs text-zinc-500 max-w-md mb-4 leading-relaxed">
                    Status overview displaying monitored wallet addresses, observed rotation activity, last active timestamp, and unread rotation indicators.
                  </p>
                  <div className="w-full max-w-md border border-zinc-800 rounded bg-zinc-950/60 p-2.5 text-[11px] text-zinc-400 text-left">
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 text-[10px] font-semibold uppercase">
                      <span>Observed Address</span>
                      <span>Activity Status</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                      <span className="text-zinc-400 font-mono">0x[sample_wallet_alpha]</span>
                      <span className="text-emerald-400">rotated (within window)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-zinc-400 font-mono">0x[sample_wallet_beta]</span>
                      <span className="text-zinc-500">idle</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
