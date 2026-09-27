"use client";

import React from "react";
import Link from "next/link";
import { WakeLogo, GitHubIcon } from "@/components/icons";
import { ArrowUp, ArrowUpRight, Terminal, ShieldCheck } from "lucide-react";

interface FooterProps {
  onOpenInstall?: () => void;
  onOpenDocs?: () => void;
}

export function Footer({ onOpenInstall, onOpenDocs }: FooterProps) {
  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    const demoEl = document.getElementById("network-demo");
    if (demoEl) {
      demoEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      aria-label="Site Footer"
      className="w-full border-t border-zinc-200/80 bg-white text-zinc-600 font-sans selection:bg-zinc-950 selection:text-white"
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
        {/* Main Content Grid: Clean, minimalist 2-column layout */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12 pb-10 border-b border-zinc-200/60">
          {/* Brand & Technical Identity */}
          <div className="flex flex-col space-y-3.5 max-w-md">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-zinc-950 focus-visible:outline-offset-4 rounded-md"
                aria-label="Wake Home"
              >
                <WakeLogo />
              </Link>
              <span className="font-mono text-[10px] font-semibold tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200/80">
                v0.4.2 · preview
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              Local TypeScript terminal for observing wallet rotations on Robinhood Chain.
              Deterministic replay, verified transaction evidence, zero remote telemetry.
            </p>

            {/* Local Engine Security & Privacy Pill */}
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500 bg-[#fafaf9] px-2.5 py-1 rounded-md border border-zinc-200/70 w-fit">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span>100% Localhost Execution</span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-400">Zero Analytics</span>
            </div>
          </div>

          {/* Functional Links (Fully wired, no fake links or AI filler) */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-14 font-mono text-xs">
            {/* Navigation Column */}
            <div className="flex flex-col space-y-2.5">
              <span className="font-bold text-zinc-950 uppercase tracking-wider text-[10px]">
                Product
              </span>
              <button
                type="button"
                onClick={scrollToDemo}
                className="text-left text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
              >
                Network Terminal Demo
              </button>
              {onOpenDocs && (
                <button
                  type="button"
                  onClick={onOpenDocs}
                  className="text-left text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  Architecture & Docs
                </button>
              )}
              {onOpenInstall && (
                <button
                  type="button"
                  onClick={onOpenInstall}
                  className="text-left text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  CLI Installation
                </button>
              )}
            </div>

            {/* Technical Resources */}
            <div className="flex flex-col space-y-2.5">
              <span className="font-bold text-zinc-950 uppercase tracking-wider text-[10px]">
                Resources
              </span>
              <a
                href="https://github.com/wealthy-org/Wake"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 transition-colors group"
              >
                <GitHubIcon className="size-3.5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                <span>GitHub Repository</span>
                <ArrowUpRight className="size-3 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <a
                href="https://explorer.robinhood.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 transition-colors group"
              >
                <span>Robinhood Chain RPC</span>
                <ArrowUpRight className="size-3 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                <ShieldCheck className="size-3 text-emerald-600" />
                <span>Deterministic RPC Replay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar: Mandatory Observational Disclaimer & Back to Top */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p className="max-w-2xl leading-relaxed text-zinc-500 text-balance">
            Wake is strictly an observational terminal for inspecting historical wallet rotations.
            It does not provide financial signals, investment advice, or automated trade execution.
          </p>

          <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
            <span className="text-zinc-400">Wealthy © {new Date().getFullYear()}</span>
            <span className="text-zinc-300">·</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer group"
              aria-label="Back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp className="size-3 text-zinc-400 group-hover:text-zinc-900 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
