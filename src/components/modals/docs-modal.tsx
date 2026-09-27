"use client";

import React from "react";
import { BookOpen, ExternalLink, FileCode, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const docs = [
    {
      name: "ALGORITHM.md",
      title: "Rotation Pairing & Algorithm",
      desc: "Deterministic matching rules, 5m–1h match windows, tie-breaks, clean vs unclear link classifications.",
      path: "docs/ALGORITHM.md",
    },
    {
      name: "ENGINE.md",
      title: "Shared Session Engine",
      desc: "Event bus architecture, shared session clock, sample replay runner, and live ingest pipeline.",
      path: "docs/ENGINE.md",
    },
    {
      name: "COVERAGE.md",
      title: "Data Coverage Limits",
      desc: "Honest boundaries: Pons V2 bonding curve and graduated v4 pools; timestamp interpolation notice.",
      path: "docs/COVERAGE.md",
    },
    {
      name: "RADAR.md",
      title: "Inflow Scoring & Ranking",
      desc: "0–100 scoring algorithm (inflow, acceleration, breadth, quality) and under-the-radar presets.",
      path: "docs/RADAR.md",
    },
    {
      name: "PERMISSION.md",
      title: "Attribution & Origin",
      desc: "Authorized TypeScript port of STAMPEDE (github.com/Argona7/stampede) with verified permission.",
      path: "docs/PERMISSION.md",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-0.5">
            <BookOpen className="size-3.5" />
            Technical Documentation
          </div>
          <DialogTitle>Wake Specifications</DialogTitle>
          <DialogDescription>
            Complete engineering blueprints, algorithm definitions, and parity test references.
          </DialogDescription>
        </DialogHeader>

        {/* Docs List */}
        <div className="py-4 space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {docs.map((doc) => (
            <a
              key={doc.name}
              href={`https://github.com/wealthy-org/Wake/blob/main/${doc.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-100/70 hover:border-zinc-300 transition-all text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCode className="size-3.5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                  <span className="font-mono text-xs font-semibold text-zinc-900">
                    {doc.name}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-sans">
                    — {doc.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed pl-5.5">
                  {doc.desc}
                </p>
              </div>

              <ExternalLink className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors shrink-0 mt-0.5" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>All algorithms documented with zero telemetry</span>
          </div>
          <a
            href="https://github.com/wealthy-org/Wake/tree/main/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-zinc-900 hover:underline"
          >
            View all on GitHub <ExternalLink className="size-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
