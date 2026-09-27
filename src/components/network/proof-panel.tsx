"use client";

import { Check, Copy, ExternalLink, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { ProofRow } from "./network-types";

interface ProofPanelProps {
  selectedPair: { fromToken: string; toToken: string } | null;
  selectedWalletAddress: string | null;
  proofRows: ProofRow[];
  onClose: () => void;
  onSelectWallet: (address: string) => void;
}

export function ProofPanel({
  selectedPair,
  selectedWalletAddress,
  proofRows,
  onClose,
  onSelectWallet,
}: ProofPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "CLEAN" | "UNCLEAR">("ALL");

  const filteredRows = proofRows.filter((row) => {
    if (selectedWalletAddress && row.walletAddress !== selectedWalletAddress) {
      return false;
    }
    if (
      selectedPair &&
      (row.fromToken !== selectedPair.fromToken || row.toToken !== selectedPair.toToken)
    ) {
      return false;
    }
    if (filter === "CLEAN" && row.grade !== "CLEAN") return false;
    if (filter === "UNCLEAR" && row.grade !== "UNCLEAR") return false;
    return true;
  });

  const cleanCount = proofRows.filter(
    (r) =>
      (!selectedPair || (r.fromToken === selectedPair.fromToken && r.toToken === selectedPair.toToken)) &&
      (!selectedWalletAddress || r.walletAddress === selectedWalletAddress) &&
      r.grade === "CLEAN"
  ).length;

  const unclearCount = proofRows.filter(
    (r) =>
      (!selectedPair || (r.fromToken === selectedPair.fromToken && r.toToken === selectedPair.toToken)) &&
      (!selectedWalletAddress || r.walletAddress === selectedWalletAddress) &&
      r.grade === "UNCLEAR"
  ).length;

  const copyToClipboard = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    }
  };

  const currentPairDisplay = selectedPair
    ? `${selectedPair.fromToken} → ${selectedPair.toToken}`
    : selectedWalletAddress
      ? "WALLET OBSERVATION"
      : "ALL ROTATIONS";

  return (
    <aside
      aria-label="Transaction Evidence Proof Panel"
      className="flex flex-col h-full max-h-full bg-white border-l border-zinc-200/80 text-zinc-900 w-full sm:w-[320px] md:w-[340px] shrink-0 font-sans select-none overflow-hidden"
    >
      {/* 1. Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200/80 bg-[#fafbfc] shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-amber-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono text-[9px] tracking-wider text-zinc-400 uppercase font-semibold">
              EVIDENCE INSPECTOR
            </span>
            <h2 className="font-mono text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <span>{currentPairDisplay}</span>
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          title="Close Proof Panel"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* 2. Pair / Scope Stats */}
      <div className="px-4 py-2 bg-white border-b border-zinc-200/60 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-zinc-400">Wallets:</span>
          <span className="text-zinc-950 font-bold bg-zinc-100/80 px-1.5 py-0.5 rounded border border-zinc-200/50">
            {cleanCount} distinct
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-zinc-400">Match Window:</span>
          <span className="text-amber-800 font-semibold bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200/70 text-[10px]">
            15m
          </span>
        </div>
      </div>

      {/* 3. Filter Tabs (Clean / Unclear) */}
      <div className="flex items-center px-4 py-2 border-b border-zinc-200/60 bg-[#fafbfc] text-[11px] font-mono gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${filter === "ALL"
              ? "bg-zinc-900 text-white font-medium shadow-xs"
              : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80"
            }`}
        >
          All ({cleanCount + unclearCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("CLEAN")}
          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${filter === "CLEAN"
              ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-300 shadow-2xs"
              : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80"
            }`}
        >
          <span>Clean ({cleanCount})</span>
        </button>
        {unclearCount > 0 && (
          <button
            type="button"
            onClick={() => setFilter("UNCLEAR")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${filter === "UNCLEAR"
                ? "bg-amber-50 text-amber-800 font-semibold border border-amber-300 shadow-2xs"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80"
              }`}
          >
            <span>Unclear ({unclearCount})</span>
          </button>
        )}
      </div>

      {/* 4. Evidence Rows List - Scrollable within panel height */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-zinc-100 p-3 space-y-2.5 overscroll-contain">
        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 text-xs font-mono">
            <p>No observations match current filter.</p>
          </div>
        ) : (
          filteredRows.map((row) => {
            const shortAddr = `${row.walletAddress.slice(0, 6)}…${row.walletAddress.slice(-4)}`;
            const isRowSelected = selectedWalletAddress === row.walletAddress;

            return (
              <div
                key={row.id}
                className={`p-3 rounded-lg border transition-all text-xs font-mono ${isRowSelected
                    ? "bg-amber-50/70 border-amber-400 shadow-2xs"
                    : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60"
                  }`}
              >
                {/* Top: Wallet address + Grade Badge + Delta */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-150">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectWallet(row.walletAddress)}
                      className="font-bold text-zinc-900 hover:text-amber-700 transition-colors text-[11px] truncate cursor-pointer underline decoration-dotted decoration-zinc-400 underline-offset-2"
                      title="Inspect wallet rotations"
                    >
                      {shortAddr}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(row.walletAddress, row.id)}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded cursor-pointer"
                      title="Copy full address"
                    >
                      {copiedId === row.id ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${row.grade === "CLEAN"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-amber-50 border-amber-300 text-amber-800"
                        }`}
                    >
                      {row.grade}
                    </span>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                      Δ {row.deltaMinutes.toFixed(0)}m
                    </span>
                  </div>
                </div>

                {/* Sell Leg */}
                <div className="grid grid-cols-[46px_1fr_auto] gap-2 items-center py-1 text-[11px]">
                  <span className="text-rose-600 font-bold">SELL</span>
                  <div className="flex items-center gap-1 text-zinc-800">
                    <span className="font-bold text-zinc-950">{row.fromToken}</span>
                    <span className="text-zinc-500 text-[10px]">(${row.sellAmountUsd.toFixed(0)})</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">{row.sellTimeUtc}</span>
                </div>

                {/* Buy Leg */}
                <div className="grid grid-cols-[46px_1fr_auto] gap-2 items-center py-1 text-[11px]">
                  <span className="text-emerald-700 font-bold">BUY</span>
                  <div className="flex items-center gap-1 text-zinc-800">
                    <span className="font-bold text-zinc-950">{row.toToken}</span>
                    <span className="text-zinc-500 text-[10px]">(${row.buyAmountUsd.toFixed(0)})</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">{row.buyTimeUtc}</span>
                </div>

                {/* Subtext / Evidence Details */}
                <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="truncate">
                    Block #{row.sellBlock} → #{row.buyBlock}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-600 font-medium">
                    <span>Blockscout</span>
                    <ExternalLink className="size-2.5 text-zinc-400" />
                  </span>
                </div>

                {row.note && (
                  <div className="mt-1.5 text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                    {row.note}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Panel Footer note */}
      <div className="px-4 py-2.5 bg-[#fafaf9] border-t border-zinc-200 text-[10px] font-mono text-zinc-500 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1">
          <ShieldCheck className="size-3 text-emerald-600" />
          <span>Robinhood Chain</span>
        </span>
        <span>Replay: 12:49 UTC</span>
      </div>
    </aside>
  );
}
