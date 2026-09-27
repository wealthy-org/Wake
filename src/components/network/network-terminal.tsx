"use client";

import {
  Database,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { DEMO_PROOF_ROWS } from "./demo-data";
import { NetworkCanvas } from "./network-canvas";
import { ProofPanel } from "./proof-panel";

export function NetworkTerminal() {
  const [selectedPair, setSelectedPair] = useState<{
    fromToken: string;
    toToken: string;
  } | null>({ fromToken: "PON", toToken: "RHO" });

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(
    "0x7A91b3D42F80e56B898d9E56C3B140B48043D42F"
  );

  const [isProofOpen, setIsProofOpen] = useState<boolean>(true);
  const [mobileMode, setMobileMode] = useState<"canvas" | "proof" | "vertical">("canvas");

  return (
    <div className="w-full max-w-[1240px] mx-auto rounded-2xl border border-zinc-200/90 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden font-sans text-zinc-900">
      {/* 1. Terminal Top Bar */}
      <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200/80 bg-[#fafbfc] select-none gap-3">
        {/* Left: Window Dots & Product Title */}
        <div className="flex items-center gap-3.5">
          {/* Subtle Studio Window Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-zinc-300/80 hover:bg-rose-400 transition-colors" />
            <span className="size-2.5 rounded-full bg-zinc-300/80 hover:bg-amber-400 transition-colors" />
            <span className="size-2.5 rounded-full bg-zinc-300/80 hover:bg-emerald-400 transition-colors" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs sm:text-sm font-bold tracking-tight text-zinc-950 flex items-center gap-1.5">
              <Terminal className="size-3.5 text-amber-600" />
              <span>WAKE</span>
            </span>
            <span className="text-zinc-300">/</span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-zinc-600 uppercase">
              ROTATION TERMINAL
            </span>
          </div>

          {/* Mandatory Mode Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50/80 border border-amber-300/70 text-amber-900 font-mono text-[10px] font-bold shadow-2xs">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>SAMPLE · REPLAY 20×</span>
          </div>
        </div>

        {/* Center/Right: Session Metadata & Filtering Scope */}
        <div className="flex items-center flex-wrap gap-3 text-xs font-mono text-zinc-600">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-zinc-400">Scope:</span>
            <span className="text-zinc-800 font-semibold bg-zinc-100/80 px-2 py-0.5 rounded border border-zinc-200/60">
              12 of 47 links
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] bg-white px-2 py-0.5 rounded border border-zinc-200/70 shadow-2xs">
            <span className="text-zinc-400">Match window:</span>
            <span className="text-amber-800 font-bold">15m</span>
          </div>

          <button
            type="button"
            onClick={() => setIsProofOpen(!isProofOpen)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer shadow-2xs ${isProofOpen
                ? "bg-zinc-900 border-zinc-900 text-white font-medium hover:bg-black"
                : "bg-white border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50"
              }`}
          >
            <SlidersHorizontal className="size-3" />
            <span>{isProofOpen ? "Hide Proof Panel" : "Show Proof Panel"}</span>
          </button>
        </div>
      </header>

      {/* 2. Mobile View Switcher (Desktop hidden) */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 border-b border-zinc-200 bg-[#fbfbfa] font-mono text-xs">
        <span className="text-zinc-600 font-medium">View Mode:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileMode("canvas")}
            className={`px-2.5 py-1 rounded text-xs ${mobileMode === "canvas" ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
              }`}
          >
            2D Canvas
          </button>
          <button
            type="button"
            onClick={() => setMobileMode("vertical")}
            className={`px-2.5 py-1 rounded text-xs ${mobileMode === "vertical" ? "bg-amber-100 text-amber-900 font-bold border border-amber-300" : "text-zinc-600 hover:text-zinc-900"
              }`}
          >
            Sequence
          </button>
          <button
            type="button"
            onClick={() => setMobileMode("proof")}
            className={`px-2.5 py-1 rounded text-xs ${mobileMode === "proof" ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
              }`}
          >
            Proof ({DEMO_PROOF_ROWS.length})
          </button>
        </div>
      </div>

      {/* 3. Main Observation Work Area - Fixed Height so Canvas and Sidebar Fit Exactly */}
      <div className="relative flex flex-col md:flex-row w-full h-[580px] sm:h-[620px] md:h-[660px] overflow-hidden">
        {/* Mobile Vertical Sequence View (Alternative for small screens) */}
        {mobileMode === "vertical" && (
          <div className="flex-1 md:hidden flex flex-col items-center justify-center p-6 bg-white font-mono text-center space-y-5 overflow-y-auto">
            <span className="text-xs text-amber-800 uppercase tracking-widest font-bold">
              Observed Wallet Rotation
            </span>

            {/* Sequence Flow */}
            <div className="flex flex-col items-center space-y-2.5 w-full max-w-xs">
              <div className="w-full p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500 text-xs">TOKEN SOLD</span>
                <span className="font-bold text-lg text-zinc-900">PON</span>
              </div>

              <div className="flex flex-col items-center text-rose-600 text-xs font-bold py-0.5">
                <span>↓ SELL ($182)</span>
              </div>

              <div className="w-full p-4 rounded-lg bg-amber-50/70 border-2 border-amber-400 shadow-xs flex flex-col items-center">
                <span className="text-[10px] text-amber-800 font-bold mb-1">OBSERVED WALLET</span>
                <span className="text-sm font-bold text-zinc-900 font-mono">0x7A91…D42F</span>
                <span className="text-xs text-zinc-600 mt-1">Δ 7m window</span>
              </div>

              <div className="flex flex-col items-center text-emerald-700 text-xs font-bold py-0.5">
                <span>↓ BUY ($176)</span>
              </div>

              <div className="w-full p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500 text-xs">TOKEN BOUGHT</span>
                <span className="font-bold text-lg text-emerald-700">RHO</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMode("proof")}
              className="px-4 py-2 rounded-lg bg-zinc-900 text-white font-bold text-xs cursor-pointer shadow-xs hover:bg-black"
            >
              Inspect Proof Evidence →
            </button>
          </div>
        )}

        {/* 2D Canvas Area - Flex 1 min-w-0 ensures canvas takes full remaining width smoothly */}
        <div
          className={`flex-1 min-w-0 w-full h-full relative overflow-hidden ${mobileMode === "canvas" ? "block" : "hidden md:block"
            }`}
        >
          <NetworkCanvas
            selectedPair={selectedPair}
            selectedWalletAddress={selectedWalletAddress}
            onSelectPair={(pair) => {
              setSelectedPair(pair);
              if (pair) setIsProofOpen(true);
            }}
            onSelectWallet={(addr) => {
              setSelectedWalletAddress(addr);
              if (addr) setIsProofOpen(true);
            }}
            isProofOpen={isProofOpen}
            onToggleProof={() => setIsProofOpen(!isProofOpen)}
          />
        </div>

        {/* Right-Side Proof Panel - Fits exact height of canvas and scrolls internally */}
        <div
          className={`h-full max-h-full ${mobileMode === "proof"
              ? "block w-full"
              : isProofOpen
                ? "hidden md:block"
                : "hidden"
            }`}
        >
          <ProofPanel
            selectedPair={selectedPair}
            selectedWalletAddress={selectedWalletAddress}
            proofRows={DEMO_PROOF_ROWS}
            onClose={() => {
              setIsProofOpen(false);
              setMobileMode("canvas");
            }}
            onSelectWallet={(addr) => setSelectedWalletAddress(addr)}
          />
        </div>
      </div>

      {/* 4. Canvas Bottom Status & Range Summary Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#fafbfc] border-t border-zinc-200/80 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-600 gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-800 font-semibold text-[11px] sm:text-xs">
            12 wallets · 7 rotations · 15 min match window
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span className="bg-zinc-100/90 px-2 py-0.5 rounded border border-zinc-200/60 font-medium text-zinc-700">
            12 links
          </span>
          <span>·</span>
          <span className="bg-zinc-100/90 px-2 py-0.5 rounded border border-zinc-200/60 font-medium text-zinc-700">
            5 tokens
          </span>
          <span>·</span>
          <span>Replay Speed: 20×</span>
        </div>
      </div>

      {/* 5. Mandatory "How to Read" Legend */}
      <div className="px-4 sm:px-6 py-2.5 bg-white border-t border-zinc-200/70 font-mono text-[11px] text-zinc-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-zinc-950 tracking-wider text-[10px] uppercase shrink-0">
              LEGEND:
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200/60 text-[10px]">
              <span className="text-zinc-900 font-bold">A → B</span>
              <span className="text-zinc-500">observed rotation</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 text-[10px] text-rose-700 font-semibold">
              <span className="size-1.5 rounded-full bg-rose-500" />
              <span>Sell Leg</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 text-[10px] text-emerald-800 font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Buy Leg</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 text-[10px] text-amber-900 font-semibold">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>Multi-Wallet (3+)</span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-400">
            Line width = distinct wallets · Distance = layout only
          </span>
        </div>
      </div>

      {/* 6. Mandatory Honest Data Coverage Notice */}
      <div className="px-4 sm:px-6 py-2 bg-[#f8fafc] border-t border-zinc-200/70 flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-500 gap-2">
        <div className="flex items-center gap-2">
          <Database className="size-3 text-zinc-400" />
          <span>
            SAMPLE DATA · Recorded replay · not current market data · Coverage: Pons V2 bonding curves & Robinhood v4 pools
          </span>
        </div>
        <span className="text-zinc-600 font-semibold">Local execution · Zero network telemetry</span>
      </div>
    </div>
  );
}
