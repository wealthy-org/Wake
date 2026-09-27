"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, ShieldCheck, Cpu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallModal({ isOpen, onClose }: InstallModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      num: "01",
      title: "Prerequisite",
      desc: "Ensure you have Node.js 22 or later installed. No Python or compilation tools required.",
      cmd: "node -v  # v22.0.0 or higher",
    },
    {
      num: "02",
      title: "Clone & Install",
      desc: "Clone the official repository and install dependencies locally.",
      cmd: "git clone https://github.com/wealthy-org/Wake.git && cd wake && npm install",
    },
    {
      num: "03",
      title: "Run Terminal",
      desc: "Start your local instance or run demo mode with pre-recorded sample data.",
      cmd: "npm run start  # or: wake demo",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-0.5">
            <Terminal className="size-3.5" />
            Local Terminal Setup
          </div>
          <DialogTitle>Install Wake Locally</DialogTitle>
          <DialogDescription>
            Wake runs 100% on your local machine. No external servers, accounts, or wallet connections.
          </DialogDescription>
        </DialogHeader>

        {/* Steps */}
        <div className="py-4 space-y-3.5">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-zinc-400">
                    {step.num}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900">
                    {step.title}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => copyToClipboard(step.cmd, idx)}
                  className="font-mono text-xs gap-1.5 h-7 px-2.5 bg-white shadow-2xs hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 cursor-pointer"
                  aria-label={`Copy command for step ${step.num}`}
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="size-3 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-zinc-600 mb-2.5">
                {step.desc}
              </p>
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto">
                <span className="text-zinc-400 select-none">$</span>
                <code className="flex-1 whitespace-nowrap">{step.cmd}</code>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-zinc-700 shrink-0" />
            <span>Pure TypeScript. Zero telemetry. No private keys.</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <Cpu className="size-3.5" />
            <span>Localhost only (127.0.0.1)</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
