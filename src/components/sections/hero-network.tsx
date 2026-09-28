"use client";

import React, { useEffect, useRef, useState } from "react";

interface NetworkNode {
  id: string;
  type: "wallet" | "token" | "pool";
  label: string;
  sublabel: string;
  x: number;
  y: number;
  tier: "all" | "tablet" | "desktop";
}

interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  flowLabel?: string;
  tier: "all" | "tablet" | "desktop";
}

// 12 strategically positioned entities framing the Hero perimeter
// Spatial composition: high density on left & right edges and bottom; quiet central headline area
const HERO_NODES: NetworkNode[] = [
  // LEFT FLANK (Bonding curve mint & initial capital entry)
  {
    id: "wallet-1",
    type: "wallet",
    label: "WALLET A",
    sublabel: "0x71...4A2",
    x: 130,
    y: 150,
    tier: "all",
  },
  {
    id: "token-x",
    type: "token",
    label: "TOKEN X",
    sublabel: "PONS",
    x: 290,
    y: 230,
    tier: "all",
  },
  {
    id: "pool-pons",
    type: "pool",
    label: "PONS V2",
    sublabel: "CURVE",
    x: 140,
    y: 380,
    tier: "tablet",
  },
  {
    id: "wallet-2",
    type: "wallet",
    label: "WALLET B",
    sublabel: "0x92...81C",
    x: 290,
    y: 520,
    tier: "tablet",
  },
  {
    id: "wallet-6",
    type: "wallet",
    label: "WALLET F",
    sublabel: "0x84...C31",
    x: 90,
    y: 630,
    tier: "desktop",
  },

  // RIGHT FLANK (Secondary liquidity & recipient offloading)
  {
    id: "token-y",
    type: "token",
    label: "TOKEN Y",
    sublabel: "ASSET",
    x: 1150,
    y: 160,
    tier: "all",
  },
  {
    id: "pool-v4",
    type: "pool",
    label: "V4 POOL",
    sublabel: "0.05%",
    x: 1310,
    y: 280,
    tier: "tablet",
  },
  {
    id: "wallet-3",
    type: "wallet",
    label: "WALLET C",
    sublabel: "0x38...9F1",
    x: 1150,
    y: 440,
    tier: "tablet",
  },
  {
    id: "wallet-4",
    type: "wallet",
    label: "WALLET D",
    sublabel: "0x5A...2E8",
    x: 1320,
    y: 570,
    tier: "desktop",
  },

  // LOWER PERIPHERY (Inter-network routing, safely below CTAs)
  {
    id: "token-base",
    type: "token",
    label: "RH-ETH",
    sublabel: "BASE",
    x: 430,
    y: 700,
    tier: "desktop",
  },
  {
    id: "pool-router",
    type: "pool",
    label: "ROUTER",
    sublabel: "DISPATCH",
    x: 720,
    y: 720,
    tier: "all",
  },
  {
    id: "wallet-5",
    type: "wallet",
    label: "WALLET E",
    sublabel: "0x14...5E0",
    x: 1010,
    y: 700,
    tier: "desktop",
  },
];

// Defined, semantically meaningful relationships (Wallet -> Token, Token -> Pool, Pool -> Wallet, Wallet -> Wallet)
const HERO_EDGES: NetworkEdge[] = [
  // Left flank chain: Wallet A buys Token X on Pons V2 curve -> distributes to Wallet B
  { id: "e1", source: "wallet-1", target: "token-x", flowLabel: "mint", tier: "all" },
  { id: "e2", source: "token-x", target: "pool-pons", flowLabel: "deposit", tier: "tablet" },
  { id: "e3", source: "pool-pons", target: "wallet-2", flowLabel: "transfer", tier: "tablet" },
  { id: "e4", source: "wallet-1", target: "wallet-2", flowLabel: "peer", tier: "tablet" },
  { id: "e5", source: "wallet-6", target: "pool-pons", flowLabel: "observe", tier: "desktop" },

  // Right flank chain: Token Y swapped on v4 Pool -> Wallet C -> Wallet D
  { id: "e6", source: "token-y", target: "pool-v4", flowLabel: "swap", tier: "tablet" },
  { id: "e7", source: "pool-v4", target: "wallet-3", flowLabel: "settle", tier: "tablet" },
  { id: "e8", source: "wallet-3", target: "wallet-4", flowLabel: "transfer", tier: "desktop" },
  { id: "e9", source: "token-y", target: "wallet-3", flowLabel: "hold", tier: "all" },

  // Lower peripheral chain: cross-asset routing across router to Wallet E and C
  { id: "e10", source: "wallet-2", target: "token-base", flowLabel: "exit", tier: "desktop" },
  { id: "e11", source: "token-base", target: "pool-router", flowLabel: "route", tier: "desktop" },
  { id: "e12", source: "pool-router", target: "wallet-5", flowLabel: "route", tier: "desktop" },
  { id: "e13", source: "wallet-5", target: "wallet-3", flowLabel: "fund", tier: "desktop" },
];

// Replay sequence: One sparse, purposeful observation sequence at a time
interface AnimationStep {
  edgeId: string;
  durationMs: number;
  pauseAfterMs: number;
  accent: "token" | "pool" | "wallet";
}

const FLOW_SEQUENCE: AnimationStep[] = [
  { edgeId: "e1", durationMs: 3400, pauseAfterMs: 1400, accent: "token" },   // Wallet A -> Token X
  { edgeId: "e2", durationMs: 3200, pauseAfterMs: 1200, accent: "pool" },    // Token X -> Pons V2
  { edgeId: "e3", durationMs: 3200, pauseAfterMs: 1400, accent: "wallet" },  // Pons V2 -> Wallet B
  { edgeId: "e6", durationMs: 3400, pauseAfterMs: 1200, accent: "pool" },    // Token Y -> v4 Pool
  { edgeId: "e7", durationMs: 3200, pauseAfterMs: 1400, accent: "wallet" },  // v4 Pool -> Wallet C
  { edgeId: "e11", durationMs: 3600, pauseAfterMs: 1600, accent: "pool" },   // RH-ETH -> Router
];

export function HeroNetwork() {
  const [mounted, setMounted] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [discoveredNodes, setDiscoveredNodes] = useState<Record<string, boolean>>({});

  const animFrameRef = useRef<number | null>(null);
  const stepStartRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const pauseStartRef = useRef<number>(0);

  // Map nodes by id for quick coordinate resolution
  const nodeMap = React.useMemo(() => {
    const map: Record<string, NetworkNode> = {};
    for (const node of HERO_NODES) {
      map[node.id] = node;
    }
    return map;
  }, []);

  // Progressive staggered discovery on initial mount
  useEffect(() => {
    setMounted(true);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Reveal all immediately without animation
      const all: Record<string, boolean> = {};
      HERO_NODES.forEach((n) => {
        all[n.id] = true;
      });
      setDiscoveredNodes(all);
      return;
    }

    // Staggered node discovery (400-600ms per node)
    HERO_NODES.forEach((node, idx) => {
      const timer = setTimeout(() => {
        setDiscoveredNodes((prev) => ({ ...prev, [node.id]: true }));
      }, 120 + idx * 80);
      return () => clearTimeout(timer);
    });
  }, []);

  // Ambient Flow Animation Loop
  useEffect(() => {
    if (!mounted) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    let currentStepIdx = 0;
    stepStartRef.current = performance.now();
    isPausedRef.current = false;

    const tick = (now: number) => {
      const step = FLOW_SEQUENCE[currentStepIdx];
      const edge = HERO_EDGES.find((e) => e.id === step.edgeId);

      if (!isPausedRef.current) {
        const elapsed = now - stepStartRef.current;
        const curProgress = Math.min(1, elapsed / step.durationMs);
        setProgress(curProgress);

        if (curProgress >= 1) {
          // Flow marker arrived at destination
          isPausedRef.current = true;
          pauseStartRef.current = now;
          if (edge) {
            setHighlightedNodeId(edge.target);
          }
        }
      } else {
        const pauseElapsed = now - pauseStartRef.current;
        if (pauseElapsed > step.pauseAfterMs * 0.7) {
          // Fade highlight
          setHighlightedNodeId(null);
        }

        if (pauseElapsed >= step.pauseAfterMs) {
          // Transition to next sequence step
          currentStepIdx = (currentStepIdx + 1) % FLOW_SEQUENCE.length;
          setActiveStepIndex(currentStepIdx);
          isPausedRef.current = false;
          stepStartRef.current = now;
          setProgress(0);
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [mounted]);

  // Compute active flow marker position
  const activeStep = FLOW_SEQUENCE[activeStepIndex];
  const activeEdge = HERO_EDGES.find((e) => e.id === activeStep.edgeId);
  const sourceNode = activeEdge ? nodeMap[activeEdge.source] : null;
  const targetNode = activeEdge ? nodeMap[activeEdge.target] : null;

  let markerPos: { x: number; y: number } | null = null;
  if (sourceNode && targetNode && !isPausedRef.current) {
    markerPos = {
      x: sourceNode.x + (targetNode.x - sourceNode.x) * progress,
      y: sourceNode.y + (targetNode.y - sourceNode.y) * progress,
    };
  }

  // Responsive class based on tier
  const getTierClass = (tier: "all" | "tablet" | "desktop") => {
    switch (tier) {
      case "all":
        return "";
      case "tablet":
        return "hidden sm:inline";
      case "desktop":
        return "hidden lg:inline";
    }
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 780"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle line gradient fading toward center */}
          <linearGradient id="edge-fade-left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A1A1AA" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D4D4D8" stopOpacity="0.25" />
          </linearGradient>

          {/* Marker subtle shadow */}
          <filter id="marker-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* 1. EDGES / RELATIONSHIP LINES */}
        <g className="edges-layer">
          {HERO_EDGES.map((edge) => {
            const src = nodeMap[edge.source];
            const dst = nodeMap[edge.target];
            if (!src || !dst) return null;

            const isActive = activeEdge?.id === edge.id;

            return (
              <g key={edge.id} className={getTierClass(edge.tier)}>
                {/* Resting low-opacity edge */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke={isActive ? "#71717A" : "#D4D4D8"}
                  strokeWidth={isActive ? "1.6" : "1.1"}
                  strokeOpacity={isActive ? "0.65" : "0.35"}
                  strokeDasharray={isActive ? undefined : "3 3"}
                  className="transition-all duration-500 ease-out"
                />

                {/* Subtle directional chevron or flow indicator in resting state */}
                {isActive && (
                  <circle
                    cx={src.x + (dst.x - src.x) * 0.5}
                    cy={src.y + (dst.y - src.y) * 0.5}
                    r="2"
                    fill="#71717A"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* 2. ACTIVE FLOW MARKER (Single sparse purposeful movement) */}
        {markerPos && activeEdge && (
          <g
            className={getTierClass(activeEdge.tier)}
            transform={`translate(${markerPos.x}, ${markerPos.y})`}
          >
            {/* Soft outer glow */}
            <circle
              r="8"
              fill={
                activeStep.accent === "token"
                  ? "#059669"
                  : activeStep.accent === "pool"
                  ? "#D97706"
                  : "#18181B"
              }
              opacity="0.12"
            />
            {/* Crisp inner halo */}
            <circle
              r="4.5"
              fill="#FFFFFF"
              stroke={
                activeStep.accent === "token"
                  ? "#059669"
                  : activeStep.accent === "pool"
                  ? "#D97706"
                  : "#18181B"
              }
              strokeWidth="1.2"
              filter="url(#marker-glow)"
            />
            {/* Center light core */}
            <circle
              r="2"
              fill={
                activeStep.accent === "token"
                  ? "#059669"
                  : activeStep.accent === "pool"
                  ? "#D97706"
                  : "#18181B"
              }
            />
          </g>
        )}

        {/* 3. NODES LAYER */}
        <g className="nodes-layer">
          {HERO_NODES.map((node) => {
            const isDiscovered = discoveredNodes[node.id] || false;
            const isHighlighted = highlightedNodeId === node.id;

            return (
              <g
                key={node.id}
                className={getTierClass(node.tier)}
                transform={`translate(${node.x}, ${node.y})`}
                style={{
                  opacity: isDiscovered ? 1 : 0,
                  transform: `translate(${node.x}px, ${node.y}px) scale(${
                    isDiscovered ? (isHighlighted ? 1.04 : 1) : 0.94
                  })`,
                  transition: "opacity 500ms ease-out, transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Visual form 1: WALLET ENTITY (Rounded Rectangle) */}
                {node.type === "wallet" && (
                  <g>
                    {/* Settlement highlight ring */}
                    {isHighlighted && (
                      <rect
                        x="-56"
                        y="-22"
                        width="112"
                        height="44"
                        rx="8"
                        fill="none"
                        stroke="#18181B"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        className="animate-pulse"
                      />
                    )}
                    {/* Wallet Base Card */}
                    <rect
                      x="-52"
                      y="-19"
                      width="104"
                      height="38"
                      rx="6"
                      fill="#FFFFFF"
                      stroke={isHighlighted ? "#18181B" : "#E4E4E7"}
                      strokeWidth={isHighlighted ? "1.4" : "1"}
                      filter="drop-shadow(0 1px 3px rgba(0,0,0,0.03))"
                    />
                    {/* Subtle Account Glyph */}
                    <circle cx="-38" cy="0" r="4.5" fill="#F4F4F5" stroke="#D4D4D8" strokeWidth="0.8" />
                    <circle cx="-38" cy="0" r="1.8" fill={isHighlighted ? "#18181B" : "#71717A"} />

                    {/* Label and Address */}
                    <text
                      x="-26"
                      y="-3"
                      fill="#27272A"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                      letterSpacing="0.02em"
                    >
                      {node.label}
                    </text>
                    <text
                      x="-26"
                      y="9"
                      fill="#71717A"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {node.sublabel}
                    </text>
                  </g>
                )}

                {/* Visual form 2: TOKEN ASSET (Hexagonal Asset Node) */}
                {node.type === "token" && (
                  <g>
                    {/* Highlight ring */}
                    {isHighlighted && (
                      <polygon
                        points="0,-29 38,-14.5 38,14.5 0,29 -38,14.5 -38,-14.5"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                        className="animate-pulse"
                      />
                    )}
                    {/* Token Hexagon */}
                    <polygon
                      points="0,-25 34,-12.5 34,12.5 0,25 -34,12.5 -34,-12.5"
                      fill="#FFFFFF"
                      stroke={isHighlighted ? "#059669" : "#D4D4D8"}
                      strokeWidth={isHighlighted ? "1.5" : "1.1"}
                      filter="drop-shadow(0 1px 3px rgba(0,0,0,0.04))"
                    />
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill={isHighlighted ? "#065F46" : "#18181B"}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.04em"
                    >
                      {node.label}
                    </text>
                    <text
                      x="0"
                      y="9"
                      textAnchor="middle"
                      fill="#71717A"
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      {node.sublabel}
                    </text>
                  </g>
                )}

                {/* Visual form 3: POOL INFRASTRUCTURE (Diamond Technical Node) */}
                {node.type === "pool" && (
                  <g>
                    {/* Highlight ring */}
                    {isHighlighted && (
                      <polygon
                        points="0,-27 42,0 0,27 -42,0"
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                        className="animate-pulse"
                      />
                    )}
                    {/* Pool Diamond */}
                    <polygon
                      points="0,-23 37,0 0,23 -37,0"
                      fill="#FAFAF9"
                      stroke={isHighlighted ? "#D97706" : "#CBD5E1"}
                      strokeWidth={isHighlighted ? "1.4" : "1"}
                      strokeDasharray={isHighlighted ? undefined : "3 2"}
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.03))"
                    />
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill={isHighlighted ? "#92400E" : "#334155"}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.label}
                    </text>
                    <text
                      x="0"
                      y="8"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="7"
                      fontFamily="monospace"
                    >
                      {node.sublabel}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
