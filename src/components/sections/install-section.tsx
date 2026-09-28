"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, Laptop } from "lucide-react";

export function InstallSection() {
  const [copiedStep2, setCopiedStep2] = useState(false);
  const [copiedStep3, setCopiedStep3] = useState(false);

  const step2Code = `git clone https://github.com/wealthy-org/Wake.git\ncd wake\nnpm install`;
  const step3Code = `npm run start`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section
      id="install"
      aria-label="Installation Guide"
      className="w-full py-16 sm:py-24 px-5 sm:px-8 border-b border-zinc-200/80 bg-[#fbfbfa]"
    >
      <div className="max-w-[1000px] mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-600 bg-zinc-200/70 border border-zinc-300/80 mb-3">
            <Terminal className="size-3 text-zinc-700" />
            <span>SETUP GUIDE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-950 font-sans mb-3 text-balance">
            Install in 3 steps
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed text-balance">
            Wake is local software built with TypeScript. Follow these steps to set up and run your instance locally.
          </p>
        </div>

        {/* MANDATORY EMPHATIC CALLOUT */}
        <div
          role="note"
          aria-label="Prerequisites notice"
          className="border-2 border-zinc-900 bg-zinc-950 text-white rounded-lg p-4 sm:p-5 mb-10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Check className="size-4" />
            </span>
            <div className="font-mono">
              <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
                No Python. No API key required for Sample mode.
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                Runs on public RPC by default. Hypersync and X mention keys are optional.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 self-start sm:self-auto shrink-0">
            Node.js only
          </span>
        </div>

        {/* 3 Step Visual Sequence */}
        <div className="space-y-6 sm:space-y-8">

          {/* STEP 1 */}
          <div className="border border-zinc-200 rounded-lg bg-white p-5 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 font-mono text-xs font-bold">
                  01
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-mono font-bold text-zinc-950 mb-1">
                    Step 1 — Runtime Requirement
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 mb-3">
                    Install <strong className="font-mono text-zinc-950">Node.js 22+</strong> on your system before proceeding.
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded border border-zinc-200">
                    <Laptop className="size-3.5 text-zinc-400" />
                    <span>Check your version:</span>
                    <code className="text-zinc-800 font-bold">node -v</code>
                    <span className="text-zinc-400">(should output v22.x or later)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="border border-zinc-200 rounded-lg bg-white p-5 sm:p-7 shadow-2xs">
            <div className="flex items-start gap-3.5 mb-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 font-mono text-xs font-bold">
                02
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-mono font-bold text-zinc-950 mb-1">
                  Step 2 — Clone & Dependencies
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600">
                  Clone the repository and install dependencies using npm.
                </p>
              </div>
            </div>

            {/* Code Block with Functional Copy Button */}
            <div className="relative rounded-md border border-zinc-300 bg-zinc-950 text-zinc-100 overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span>Terminal · bash</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(step2Code, setCopiedStep2)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  aria-label="Copy Step 2 commands"
                >
                  {copiedStep2 ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed">
                <pre className="select-all">
                  <code>{step2Code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="border border-zinc-200 rounded-lg bg-white p-5 sm:p-7 shadow-2xs">
            <div className="flex items-start gap-3.5 mb-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 font-mono text-xs font-bold">
                03
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-mono font-bold text-zinc-950 mb-1">
                  Step 3 — Start Wake
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mb-3">
                  Start Wake locally:
                </p>
              </div>
            </div>

            {/* Code Block with Functional Copy Button */}
            <div className="relative rounded-md border border-zinc-300 bg-zinc-950 text-zinc-100 overflow-hidden shadow-2xs mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span>Terminal · bash</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(step3Code, setCopiedStep3)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  aria-label="Copy Step 3 command"
                >
                  {copiedStep3 ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed">
                <pre className="select-all">
                  <code>{step3Code}</code>
                </pre>
              </div>
            </div>

            {/* Local Launch Instructions */}
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs sm:text-sm text-zinc-700 space-y-2">
              <p className="font-semibold text-zinc-900">Then:</p>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">1.</span>
                <span>Open:</span>
                <code className="bg-white border border-zinc-300 px-2 py-0.5 rounded text-zinc-950 font-bold">
                  http://127.0.0.1:PORT
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">2.</span>
                <span>Click:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-900 text-white font-bold text-xs">
                  Load sample
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
