"use client";

import React from "react";
import Link from "next/link";
import { WakeLogo, GitHubIcon } from "@/components/icons";
import { ArrowUp, ArrowUpRight } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      aria-label="Documentation Site Footer"
      className="w-full border-t border-zinc-200/80 bg-white text-zinc-600 font-sans selection:bg-zinc-950 selection:text-white"
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
        {/* Top Footer Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-10 border-b border-zinc-200/80">
          {/* Identity & Technical Notice */}
          <div className="flex flex-col space-y-3.5 max-w-md">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-zinc-950 focus-visible:outline-offset-4 rounded-md"
                aria-label="Wake Home"
              >
                <WakeLogo />
              </Link>
              <span className="font-mono text-[10px] font-semibold tracking-wider text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                Documentation
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 font-mono leading-relaxed">
              Wake is local software that runs on the user&apos;s computer. The web views open at a localhost address and nobody else sees your instance. This website is documentation only.
            </p>
          </div>

          {/* Direct Technical Links (Only Real, Valid Links) */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-12 font-mono text-xs">
            <div className="flex flex-col space-y-2.5">
              <span className="font-bold text-zinc-950 uppercase tracking-wider text-[11px]">
                Project
              </span>
              <a
                href="https://github.com/wealthy-org/Wake"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                <GitHubIcon className="size-3.5 text-zinc-500" />
                <span>GitHub</span>
                <ArrowUpRight className="size-3 text-zinc-400" />
              </a>
              <a
                href="https://github.com/wealthy-org/Wake/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                <span>License (MIT)</span>
                <ArrowUpRight className="size-3 text-zinc-400" />
              </a>
            </div>

            <div className="flex flex-col space-y-2.5 max-w-xs">
              <span className="font-bold text-zinc-950 uppercase tracking-wider text-[11px]">
                Attribution
              </span>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Wake is a TypeScript port of{" "}
                <a
                  href="https://github.com/Argona7/stampede"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-900 underline hover:text-black inline-flex items-center gap-0.5"
                >
                  STAMPEDE
                  <ArrowUpRight className="size-2.5" />
                </a>
                , used with permission from its original author.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          {/* MANDATORY DISCLAIMER */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 uppercase">
              Disclaimer:
            </span>
            <span className="font-semibold text-zinc-800">
              Not financial advice.
            </span>
          </div>

          {/* Back to Top */}
          <div className="flex items-center gap-4 shrink-0">
            <span>Wake © {new Date().getFullYear()}</span>
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
