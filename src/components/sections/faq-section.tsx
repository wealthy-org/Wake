"use client";

import React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      q: "Is Wake a website I can open?",
      a: "No. It is software you run on your own computer. This site only explains it.",
    },
    {
      q: "Do I need a wallet?",
      a: "No. Wake reads public on-chain data. There is no wallet connection.",
    },
    {
      q: "Does it cost anything?",
      a: "No hosting cost. It uses public RPC by default. Optional keys such as Hypersync and X mentions are free or optional.",
    },
    {
      q: "Where is my data stored?",
      a: "Only on your machine (~/.wake/ and the local database). Nothing is sent to us.",
    },
    {
      q: "Do I need Python?",
      a: "No. Node.js 22+ only.",
    },
    {
      q: "Is this financial advice?",
      a: "No. Wake shows observed on-chain order of trades. Verdicts are model outputs, not recommendations.",
    },
    {
      q: "Why is nothing showing?",
      a: "Use Load sample first, or wait for the live backfill to finish.",
    },
    {
      q: "Is it real time?",
      a: "Only while the app is open in Live mode. It does not run in the background.",
    },
  ];

  return (
    <section
      id="faq"
      aria-label="Frequently Asked Questions"
      className="w-full py-16 sm:py-24 px-5 sm:px-8 border-b border-zinc-200/80 bg-[#fbfbfa]"
    >
      <div className="max-w-[900px] mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-600 bg-zinc-200/70 border border-zinc-300/80 mb-3">
            <HelpCircle className="size-3 text-zinc-700" />
            <span>DOCUMENTATION QUESTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-950 font-sans mb-3 text-balance">
            FAQ
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed text-balance">
            Frequently asked questions about running Wake, data privacy, and requirements.
          </p>
        </div>

        {/* Clean Accessible Expandable Accordion */}
        <div className="border border-zinc-300 rounded-lg bg-white divide-y divide-zinc-200 shadow-2xs overflow-hidden">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group transition-colors duration-150 hover:bg-[#fafaf9] open:bg-[#fafaf9]/80"
            >
              <summary className="flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer list-none select-none font-mono text-xs sm:text-sm font-bold text-zinc-950 focus-visible:outline-2 focus-visible:outline-zinc-950 focus-visible:outline-offset-2">
                <span>{faq.q}</span>
                <span className="size-6 shrink-0 rounded flex items-center justify-center text-zinc-400 group-hover:text-zinc-700 group-open:rotate-180 transition-transform duration-200">
                  <ChevronDown className="size-4" />
                </span>
              </summary>
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm font-mono text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
