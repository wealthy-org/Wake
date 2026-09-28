"use client";

import React from "react";
import { ArrowRight, Laptop, Database, Globe, Monitor, ShieldCheck } from "lucide-react";

export function ChainReadingSection() {
  return (
    <section
      id="architecture"
      aria-label="Chain Reading Architecture"
      className="w-full py-16 sm:py-24 px-5 sm:px-8 border-b border-zinc-200/80 bg-[#fbfbfa]"
    >
      <div className="max-w-[1000px] mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-600 bg-zinc-200/70 border border-zinc-300/80 mb-3">
            <Database className="size-3 text-zinc-700" />
            <span>DATA FLOW ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-950 font-sans mb-3 text-balance">
            How it reads the chain
          </h2>
          {/* MANDATORY CONCISE EXPLANATION */}
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed text-balance">
            Wake reads public on-chain data and presents the resulting views locally. There is no Wake server storing the user&apos;s data.
          </p>
        </div>

        {/* High-level Diagram Flow Highlight */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs sm:text-sm font-bold text-zinc-900 mb-8 p-3.5 bg-white border border-zinc-200 rounded-lg shadow-2xs">
          <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Flow:</span>
          <span className="px-2.5 py-1 bg-zinc-100 rounded border border-zinc-200 text-zinc-900">
            Public RPC
          </span>
          <ArrowRight className="size-3.5 text-zinc-400" />
          <span className="px-2.5 py-1 bg-zinc-900 text-white rounded border border-zinc-900">
            Your laptop
          </span>
          <ArrowRight className="size-3.5 text-zinc-400" />
          <span className="px-2.5 py-1 bg-zinc-100 rounded border border-zinc-200 text-zinc-900">
            Local Wake views
          </span>
        </div>

        {/* 2D Technical Diagram Container */}
        <div className="border border-zinc-300 rounded-lg bg-white p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

            {/* NODE 1: Public RPC */}
            <div className="md:col-span-3 border border-zinc-200 rounded-lg bg-[#fafaf9] p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="size-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700">
                  <Globe className="size-5" />
                </div>
              </div>
              <h3 className="font-mono text-xs font-bold text-zinc-950 uppercase mb-1">
                Public RPC
              </h3>
              <p className="text-[11px] font-mono text-zinc-500 mb-2">
                Robinhood Chain
              </p>
              <div className="border-t border-zinc-200 pt-2 text-[10px] font-mono text-zinc-500 space-y-1 text-left">
                <div>• Public RPC endpoint</div>
                <div>• Optional Hypersync</div>
                <div>• Read-only logs</div>
              </div>
            </div>

            {/* ARROW 1: Network Ingest */}
            <div className="md:col-span-1 flex md:flex-col items-center justify-center text-zinc-400">
              <span className="hidden md:block font-mono text-[9px] uppercase tracking-wider text-zinc-400 -mb-1">
                Ingest
              </span>
              <ArrowRight className="size-5 text-zinc-500" />
              <span className="md:hidden font-mono text-[10px] text-zinc-500 ml-2">
                Public logs via HTTPS
              </span>
            </div>

            {/* NODE 2: Your Laptop (The Enclosed Local Machine Boundary) */}
            <div className="md:col-span-4 border-2 border-zinc-900 rounded-lg bg-zinc-950 text-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Laptop className="size-4 text-emerald-400" />
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-tight">
                    Your Laptop
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Local Execution
                </span>
              </div>

              <div className="space-y-2 text-[11px] font-mono text-zinc-300">
                <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                  <p className="font-bold text-zinc-200">Wake Engine (TypeScript)</p>
                  <p className="text-[10px] text-zinc-400">Normalizes trades & matches rotation windows</p>
                </div>
                <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                  <p className="font-bold text-zinc-200">Local Database (~/.wake/)</p>
                  <p className="text-[10px] text-zinc-400">Local SQLite index & watchlist.json</p>
                </div>
                <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                  <p className="font-bold text-zinc-200">Local HTTP Server</p>
                  <p className="text-[10px] text-zinc-400">Serves web views on 127.0.0.1:PORT</p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800 text-[10px] font-mono text-emerald-400/90 flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-emerald-400" />
                <span>Zero telemetry · Data never leaves machine</span>
              </div>
            </div>

            {/* ARROW 2: Local Presentation */}
            <div className="md:col-span-1 flex md:flex-col items-center justify-center text-zinc-400">
              <span className="hidden md:block font-mono text-[9px] uppercase tracking-wider text-zinc-400 -mb-1">
                Loopback
              </span>
              <ArrowRight className="size-5 text-zinc-500" />
              <span className="md:hidden font-mono text-[10px] text-zinc-500 ml-2">
                Loopback on 127.0.0.1
              </span>
            </div>

            {/* NODE 3: Local Wake Views */}
            <div className="md:col-span-3 border border-zinc-200 rounded-lg bg-[#fafaf9] p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="size-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700">
                  <Monitor className="size-5" />
                </div>
              </div>
              <h3 className="font-mono text-xs font-bold text-zinc-950 uppercase mb-1">
                Local Wake views
              </h3>
              <p className="text-[11px] font-mono text-zinc-500 mb-2">
                127.0.0.1:PORT
              </p>
              <div className="border-t border-zinc-200 pt-2 text-[10px] font-mono text-zinc-500 space-y-1 text-left">
                <div>• Inflow Ranking Board</div>
                <div>• Coin Flow Inspector</div>
                <div>• 2D/3D Network Graph</div>
                <div>• Local Watchlist</div>
              </div>
            </div>

          </div>

          {/* Technical Transparency Note */}
          <div className="mt-6 pt-5 border-t border-zinc-200 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Security guarantee: No remote database, no authentication, no external telemetry.</span>
            <span className="text-zinc-400">Topology: 2D Client-Local Architecture</span>
          </div>
        </div>
      </div>
    </section>
  );
}
