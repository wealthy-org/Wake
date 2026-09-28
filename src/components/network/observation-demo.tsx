"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Bookmark,
  BookmarkCheck,
  Crosshair,
  Clock,
  ArrowRight,
  Activity,
  ShieldCheck,
} from "lucide-react";

// =========================================================================
// 1. DETERMINISTIC SAMPLE DATASET — REALISTIC ON-CHAIN OBSERVATION STORY
// =========================================================================

export type EntityType = "wallet" | "token" | "pool";

export interface ObservedAction {
  time: string;
  action: "BUY" | "SELL" | "TRANSFER" | "RECEIVE";
  asset: string;
  counterparty: string;
  venue: string;
}

export interface DemoNode {
  id: string;
  type: EntityType;
  label: string;
  sublabel: string;
  initialX: number;
  initialY: number;
  discoveryTime: number; // in seconds (Section 2: smooth entrance)
  roleDescription: string;
  observedActivity: ObservedAction[];
  relatedEntityIds: string[];
}

export interface DemoEdge {
  id: string;
  source: string;
  target: string;
  kind: "BUY" | "SELL" | "TRANSFER";
  label: string;
  appearTime: number; // in seconds (Section 3: gradual appearance)
  venue?: string;
  tokenTransferred?: string;
}

export interface ReplayMilestone {
  id: string;
  timeSec: number;
  settleTime: number; // when the transaction completes settlement
  timecode: string;
  title: string;
  action: "BUY" | "SELL" | "TRANSFER" | "DISCOVER";
  timeLabel: string;
  summary: string;
  venueLabel: string;
  primaryEntityId: string;
  activeEdgeIds: string[];
}

export interface MovingAssetMarker {
  id: string;
  kind: "token" | "payment";
  label: string;
  x: number;
  y: number;
  progress: number;
}

// Spatial Hierarchy:
// Top Center: TOKEN X (Asset)
// Mid Left: WALLET A (Actor A)  |  Mid Right: WALLET B (Recipient)
// Bottom Left: PONS V2 (Curve)  |  Bottom Right: V4 POOL (Infrastructure)
const INITIAL_DEMO_NODES: Record<string, DemoNode> = {
  "wallet-A": {
    id: "wallet-A",
    type: "wallet",
    label: "WALLET A",
    sublabel: "0x71...4A2",
    initialX: 180,
    initialY: 210,
    discoveryTime: 0.0,
    roleDescription: "Observed account executing multiple Pons V2 bonding curve entries and subsequent transfer.",
    observedActivity: [
      { time: "09:31", action: "BUY", asset: "TOKEN X", counterparty: "Pons V2 Curve", venue: "Pons V2" },
      { time: "09:38", action: "BUY", asset: "TOKEN X", counterparty: "Pons V2 Curve", venue: "Pons V2" },
      { time: "09:42", action: "TRANSFER", asset: "TOKEN X", counterparty: "Wallet B (0x92...81C)", venue: "On-Chain Transfer" },
    ],
    relatedEntityIds: ["token-X", "wallet-B", "pool-pons"],
  },
  "wallet-B": {
    id: "wallet-B",
    type: "wallet",
    label: "WALLET B",
    sublabel: "0x92...81C",
    initialX: 520,
    initialY: 210,
    discoveryTime: 10.5,
    roleDescription: "Recipient of Token X transfer; observed subsequent exit on secondary v4 liquidity pool.",
    observedActivity: [
      { time: "09:42", action: "RECEIVE", asset: "TOKEN X", counterparty: "Wallet A (0x71...4A2)", venue: "On-Chain Transfer" },
      { time: "09:47", action: "SELL", asset: "TOKEN X", counterparty: "v4 Pool", venue: "v4 Pool" },
    ],
    relatedEntityIds: ["token-X", "wallet-A", "pool-v4"],
  },
  "token-X": {
    id: "token-X",
    type: "token",
    label: "TOKEN X",
    sublabel: "PONS",
    initialX: 350,
    initialY: 90,
    discoveryTime: 2.8,
    roleDescription: "Observed asset undergoing curve mint orders, direct inter-wallet transfer, and DEX pool swap.",
    observedActivity: [
      { time: "09:31", action: "BUY", asset: "TOKEN X", counterparty: "Wallet A", venue: "Pons V2" },
      { time: "09:38", action: "BUY", asset: "TOKEN X", counterparty: "Wallet A", venue: "Pons V2" },
      { time: "09:42", action: "TRANSFER", asset: "TOKEN X", counterparty: "Wallet A → Wallet B", venue: "Transfer" },
      { time: "09:47", action: "SELL", asset: "TOKEN X", counterparty: "Wallet B / v4 Pool", venue: "v4 Pool" },
    ],
    relatedEntityIds: ["wallet-A", "wallet-B", "pool-pons", "pool-v4"],
  },
  "pool-pons": {
    id: "pool-pons",
    type: "pool",
    label: "PONS V2",
    sublabel: "Curve",
    initialX: 180,
    initialY: 350,
    discoveryTime: 2.8,
    roleDescription: "Pons V2 bonding curve infrastructure facilitating observed initial buy swaps for Wallet A.",
    observedActivity: [
      { time: "09:31", action: "BUY", asset: "TOKEN X", counterparty: "Wallet A", venue: "Pons V2" },
      { time: "09:38", action: "BUY", asset: "TOKEN X", counterparty: "Wallet A", venue: "Pons V2" },
    ],
    relatedEntityIds: ["wallet-A", "token-X"],
  },
  "pool-v4": {
    id: "pool-v4",
    type: "pool",
    label: "V4 POOL",
    sublabel: "Pool",
    initialX: 520,
    initialY: 350,
    discoveryTime: 15.0,
    roleDescription: "Robinhood Chain v4 pool infrastructure through which Wallet B executed observed exit swap.",
    observedActivity: [
      { time: "09:47", action: "SELL", asset: "TOKEN X", counterparty: "Wallet B", venue: "v4 Pool" },
    ],
    relatedEntityIds: ["wallet-B", "token-X"],
  },
};

const SAMPLE_DEMO_EDGES: DemoEdge[] = [
  // Event 1 & 2: Wallet A buys via Pons V2
  {
    id: "edge-buy-a-pons",
    source: "wallet-A",
    target: "pool-pons",
    kind: "BUY",
    label: "BUY via Pons V2",
    appearTime: 3.0,
    venue: "Pons V2 Curve",
  },
  {
    id: "edge-pons-token-x",
    source: "pool-pons",
    target: "token-X",
    kind: "BUY",
    label: "TOKEN X (Mint)",
    appearTime: 3.0,
    venue: "Pons V2 Curve",
  },
  // Event 3: Wallet A transfers Token X to Wallet B
  {
    id: "edge-transfer-a-b",
    source: "wallet-A",
    target: "wallet-B",
    kind: "TRANSFER",
    label: "TRANSFER (TOKEN X)",
    appearTime: 11.0,
    tokenTransferred: "TOKEN X",
  },
  // Event 4: Wallet B sells via v4 Pool
  {
    id: "edge-sell-b-v4",
    source: "wallet-B",
    target: "pool-v4",
    kind: "SELL",
    label: "SELL via v4 Pool",
    appearTime: 16.0,
    venue: "v4 Pool",
  },
  {
    id: "edge-v4-token-x",
    source: "pool-v4",
    target: "token-X",
    kind: "SELL",
    label: "TOKEN X (Pool Swap)",
    appearTime: 17.6,
    venue: "v4 Pool",
  },
];

// Deterministic Milestones strictly adhering to Section 21 & Animation Choreography
const REPLAY_MILESTONES: ReplayMilestone[] = [
  {
    id: "m-0",
    timeSec: 0,
    settleTime: 2.5,
    timecode: "00:00",
    title: "Wallet A discovered",
    action: "DISCOVER",
    timeLabel: "09:25",
    summary: "Actor A (0x71...4A2) identified in local observation window.",
    venueLabel: "Local Watchlist",
    primaryEntityId: "wallet-A",
    activeEdgeIds: [],
  },
  {
    id: "m-1",
    timeSec: 3.0,
    settleTime: 6.2,
    timecode: "00:03",
    title: "BUY Token X via Pons V2",
    action: "BUY",
    timeLabel: "09:31",
    summary: "09:31 BUY TOKEN X via Pons V2. Payment routes to curve; Token X mint returns.",
    venueLabel: "Pons V2",
    primaryEntityId: "wallet-A",
    activeEdgeIds: ["edge-buy-a-pons", "edge-pons-token-x"],
  },
  {
    id: "m-2",
    timeSec: 7.0,
    settleTime: 10.2,
    timecode: "00:07",
    title: "BUY Token X via Pons V2",
    action: "BUY",
    timeLabel: "09:38",
    summary: "09:38 BUY TOKEN X via Pons V2. Repeated entry establishes recurring rotation relationship.",
    venueLabel: "Pons V2",
    primaryEntityId: "wallet-A",
    activeEdgeIds: ["edge-buy-a-pons", "edge-pons-token-x"],
  },
  {
    id: "m-3",
    timeSec: 11.0,
    settleTime: 14.5,
    timecode: "00:11",
    title: "Token X transfer to Wallet B",
    action: "TRANSFER",
    timeLabel: "09:42",
    summary: "09:42 TRANSFER TOKEN X Wallet A → Wallet B (0x92...81C). Direct capital flow.",
    venueLabel: "Wallet A → Wallet B",
    primaryEntityId: "wallet-A",
    activeEdgeIds: ["edge-transfer-a-b"],
  },
  {
    id: "m-4",
    timeSec: 16.0,
    settleTime: 19.3,
    timecode: "00:16",
    title: "SELL Token X via v4 pool",
    action: "SELL",
    timeLabel: "09:47",
    summary: "09:47 SELL TOKEN X via v4 pool. Token X enters pool; payment asset returns to Wallet B.",
    venueLabel: "v4 Pool",
    primaryEntityId: "wallet-B",
    activeEdgeIds: ["edge-sell-b-v4", "edge-v4-token-x"],
  },
];

const TOTAL_TIMELINE_DURATION = 20;

// Natural cubic ease-in-out for smooth asset flow motion (Section 14)
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function ObservationDemo() {
  // Replay Clock State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Tab State for Right Panel: "history" | "inflow"
  const [activeTab, setActiveTab] = useState<"history" | "inflow">("history");

  // Node Positions (Manually draggable while preserving dynamic animation trajectory)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const coords: Record<string, { x: number; y: number }> = {};
    for (const [id, node] of Object.entries(INITIAL_DEMO_NODES)) {
      coords[id] = { x: node.initialX, y: node.initialY };
    }
    return coords;
  });

  // Selected Entity, Follow State, Watchlist
  const [selectedEntityId, setSelectedEntityId] = useState<string>("wallet-A");
  const [followedWalletId, setFollowedWalletId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(["wallet-A"]);

  // Camera Pan & Zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Pointer Interaction & Animation Loop Refs
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const draggingNodeRef = useRef<string | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const initialClickPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  // Check prefers-reduced-motion (Section 18)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-start on scroll into view
  useEffect(() => {
    const el = rootContainerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoStarted) {
          setIsPlaying(true);
          setHasAutoStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAutoStarted]);

  // High-performance 60fps RequestAnimationFrame replay loop (Sections 14, 16)
  useEffect(() => {
    if (!isPlaying) {
      lastFrameTimeRef.current = null;
      return;
    }

    let animId: number;
    const loop = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }
      const deltaMs = Math.min(timestamp - lastFrameTimeRef.current, 100);
      lastFrameTimeRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + deltaMs / 1000;
        if (next >= TOTAL_TIMELINE_DURATION) {
          setIsPlaying(false);
          return TOTAL_TIMELINE_DURATION;
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // ATTACH NATIVE WHEEL LISTENER WITH { passive: false } TO TRAP ZOOM & PREVENT PAGE SCROLL
  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Prevent landing page from scrolling when pointer is over the canvas
      e.preventDefault();
      e.stopPropagation();

      const rect = wrapper.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prevZoom) => {
        const newZoom = Math.min(2.0, Math.max(0.65, Number((prevZoom * factor).toFixed(3))));
        setPan((prevPan) => {
          const worldX = (clientX - prevPan.x) / prevZoom;
          const worldY = (clientY - prevPan.y) / prevZoom;
          return {
            x: clientX - worldX * newZoom,
            y: clientY - worldY * newZoom,
          };
        });
        return newZoom;
      });
    };

    wrapper.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => {
      wrapper.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  // Active Milestone based on current time
  const currentMilestone = useMemo(() => {
    let matched = REPLAY_MILESTONES[0];
    for (const m of REPLAY_MILESTONES) {
      if (currentTime >= m.timeSec) {
        matched = m;
      }
    }
    return matched;
  }, [currentTime]);

  // Active Moving Asset Markers (Sections 4, 5, 6, 7, 8, 9)
  const activeMovingMarkers = useMemo<MovingAssetMarker[]>(() => {
    if (prefersReducedMotion) return [];
    const markers: MovingAssetMarker[] = [];
    const posA = nodePositions["wallet-A"] || { x: INITIAL_DEMO_NODES["wallet-A"].initialX, y: INITIAL_DEMO_NODES["wallet-A"].initialY };
    const posB = nodePositions["wallet-B"] || { x: INITIAL_DEMO_NODES["wallet-B"].initialX, y: INITIAL_DEMO_NODES["wallet-B"].initialY };
    const posPons = nodePositions["pool-pons"] || { x: INITIAL_DEMO_NODES["pool-pons"].initialX, y: INITIAL_DEMO_NODES["pool-pons"].initialY };
    const posV4 = nodePositions["pool-v4"] || { x: INITIAL_DEMO_NODES["pool-v4"].initialX, y: INITIAL_DEMO_NODES["pool-v4"].initialY };

    // EVENT 01: BUY via Pons V2
    // Phase 1 (3.3s - 4.6s): Payment leaves Wallet A -> Pons V2
    if (currentTime >= 3.3 && currentTime <= 4.6) {
      const p = easeInOutCubic((currentTime - 3.3) / 1.3);
      markers.push({
        id: "buy1-payment",
        kind: "payment",
        label: "payment",
        x: posA.x + (posPons.x - posA.x) * p,
        y: posA.y + (posPons.y - posA.y) * p,
        progress: p,
      });
    }
    // Phase 2 (4.9s - 6.2s): Token X returns Pons V2 -> Wallet A
    if (currentTime >= 4.9 && currentTime <= 6.2) {
      const p = easeInOutCubic((currentTime - 4.9) / 1.3);
      markers.push({
        id: "buy1-token",
        kind: "token",
        label: "TOKEN X",
        x: posPons.x + (posA.x - posPons.x) * p,
        y: posPons.y + (posA.y - posPons.y) * p,
        progress: p,
      });
    }

    // EVENT 02: SECOND BUY via Pons V2
    // Phase 1 (7.3s - 8.6s): Payment leaves Wallet A -> Pons V2
    if (currentTime >= 7.3 && currentTime <= 8.6) {
      const p = easeInOutCubic((currentTime - 7.3) / 1.3);
      markers.push({
        id: "buy2-payment",
        kind: "payment",
        label: "payment",
        x: posA.x + (posPons.x - posA.x) * p,
        y: posA.y + (posPons.y - posA.y) * p,
        progress: p,
      });
    }
    // Phase 2 (8.9s - 10.2s): Token X returns Pons V2 -> Wallet A
    if (currentTime >= 8.9 && currentTime <= 10.2) {
      const p = easeInOutCubic((currentTime - 8.9) / 1.3);
      markers.push({
        id: "buy2-token",
        kind: "token",
        label: "TOKEN X",
        x: posPons.x + (posA.x - posPons.x) * p,
        y: posPons.y + (posA.y - posPons.y) * p,
        progress: p,
      });
    }

    // EVENT 03: TOKEN TRANSFER (Wallet A -> Wallet B)
    // In-flight (11.6s - 14.4s): Token X traverses the upper curved transfer path
    if (currentTime >= 11.6 && currentTime <= 14.4) {
      const p = easeInOutCubic((currentTime - 11.6) / 2.8);
      const ctrlX = (posA.x + posB.x) / 2;
      const ctrlY = posA.y - 48;
      // Quadratic Bezier Formula: B(p) = (1-p)^2 * P0 + 2(1-p)p * P1 + p^2 * P2
      const x = Math.pow(1 - p, 2) * posA.x + 2 * (1 - p) * p * ctrlX + Math.pow(p, 2) * posB.x;
      const y = Math.pow(1 - p, 2) * posA.y + 2 * (1 - p) * p * ctrlY + Math.pow(p, 2) * posB.y;
      markers.push({
        id: "transfer-token",
        kind: "token",
        label: "TOKEN X",
        x,
        y,
        progress: p,
      });
    }

    // EVENT 04: SELL via v4 pool
    // Phase 1 (16.3s - 17.6s): Token X leaves Wallet B -> v4 Pool
    if (currentTime >= 16.3 && currentTime <= 17.6) {
      const p = easeInOutCubic((currentTime - 16.3) / 1.3);
      markers.push({
        id: "sell-token",
        kind: "token",
        label: "TOKEN X",
        x: posB.x + (posV4.x - posB.x) * p,
        y: posB.y + (posV4.y - posB.y) * p,
        progress: p,
      });
    }
    // Phase 2 (18.0s - 19.3s): Payment returns v4 Pool -> Wallet B
    if (currentTime >= 18.0 && currentTime <= 19.3) {
      const p = easeInOutCubic((currentTime - 18.0) / 1.3);
      markers.push({
        id: "sell-payment",
        kind: "payment",
        label: "payment",
        x: posV4.x + (posB.x - posV4.x) * p,
        y: posV4.y + (posB.y - posV4.y) * p,
        progress: p,
      });
    }

    return markers;
  }, [currentTime, nodePositions, prefersReducedMotion]);

  // Determine individual Node visual states: NORMAL, ACTIVE, TRANSACTION, SETTLED (Section 11)
  const getNodeVisualState = useCallback(
    (nodeId: string): "NORMAL" | "ACTIVE" | "TRANSACTION" | "SETTLED" => {
      // Settlement windows
      if (nodeId === "wallet-A") {
        if ((currentTime >= 6.2 && currentTime <= 7.0) || (currentTime >= 10.2 && currentTime <= 11.0)) {
          return "SETTLED";
        }
        if (
          (currentTime >= 3.0 && currentTime < 6.2) ||
          (currentTime >= 7.0 && currentTime < 10.2) ||
          (currentTime >= 11.0 && currentTime < 14.5)
        ) {
          return "TRANSACTION";
        }
      }
      if (nodeId === "wallet-B") {
        if ((currentTime >= 14.4 && currentTime <= 15.5) || (currentTime >= 19.3 && currentTime <= 20.0)) {
          return "SETTLED";
        }
        if ((currentTime >= 13.0 && currentTime < 14.4) || (currentTime >= 16.0 && currentTime < 19.3)) {
          return "TRANSACTION";
        }
      }
      if (nodeId === "pool-pons") {
        if ((currentTime >= 3.0 && currentTime < 6.2) || (currentTime >= 7.0 && currentTime < 10.2)) {
          return "TRANSACTION";
        }
        if ((currentTime >= 6.2 && currentTime <= 6.8) || (currentTime >= 10.2 && currentTime <= 10.8)) {
          return "SETTLED";
        }
      }
      if (nodeId === "pool-v4") {
        if (currentTime >= 16.0 && currentTime < 19.3) {
          return "TRANSACTION";
        }
        if (currentTime >= 19.3 && currentTime <= 20.0) {
          return "SETTLED";
        }
      }
      if (nodeId === "token-X") {
        if (
          (currentTime >= 4.6 && currentTime < 6.2) ||
          (currentTime >= 8.6 && currentTime < 10.2) ||
          (currentTime >= 11.6 && currentTime < 14.4) ||
          (currentTime >= 16.3 && currentTime < 17.6)
        ) {
          return "TRANSACTION";
        }
        if ((currentTime >= 6.2 && currentTime <= 7.0) || (currentTime >= 10.2 && currentTime <= 11.0)) {
          return "SETTLED";
        }
      }

      if (followedWalletId === nodeId || selectedEntityId === nodeId) {
        return "ACTIVE";
      }
      return "NORMAL";
    },
    [currentTime, followedWalletId, selectedEntityId]
  );

  // Watchlist Toggle
  const toggleWatchlist = (walletId: string) => {
    setWatchlist((prev) =>
      prev.includes(walletId) ? prev.filter((id) => id !== walletId) : [...prev, walletId]
    );
  };

  // Follow Wallet Toggle
  const toggleFollow = (walletId: string) => {
    setFollowedWalletId((prev) => (prev === walletId ? null : walletId));
  };

  // Center / Focus Node
  const focusNode = (nodeId: string) => {
    const pos = nodePositions[nodeId];
    if (!pos || !canvasWrapperRef.current) return;
    const rect = canvasWrapperRef.current.getBoundingClientRect();
    setPan({
      x: rect.width / 2 - pos.x * zoom,
      y: rect.height / 2 - pos.y * zoom,
    });
  };

  // Reset View (camera & initial node coordinates only)
  const handleResetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    const coords: Record<string, { x: number; y: number }> = {};
    for (const [id, node] of Object.entries(INITIAL_DEMO_NODES)) {
      coords[id] = { x: node.initialX, y: node.initialY };
    }
    setNodePositions(coords);
  };

  // Reset Replay
  const handleResetReplay = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Zoom Controls
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(2.0, Math.max(0.65, Number((prev + delta).toFixed(2)))));
  };

  // Canvas Background Pointer Down (Pan)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName !== "svg" && (e.target as HTMLElement).tagName !== "rect") {
      return;
    }
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Node Pointer Down (Drag Node) - zero delay, unified movement with lines
  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    draggingNodeRef.current = nodeId;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    initialClickPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  // Pointer Move - 1:1 instantaneous movement without CSS transition delays
  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingNodeRef.current) {
      const dist = Math.hypot(
        e.clientX - initialClickPosRef.current.x,
        e.clientY - initialClickPosRef.current.y
      );
      if (dist > 2) {
        hasDraggedRef.current = true;
      }
      if (hasDraggedRef.current) {
        const dx = (e.clientX - dragStartPosRef.current.x) / zoom;
        const dy = (e.clientY - dragStartPosRef.current.y) / zoom;
        const id = draggingNodeRef.current;
        setNodePositions((prev) => {
          const cur = prev[id] || { x: 0, y: 0 };
          return {
            ...prev,
            [id]: { x: cur.x + dx, y: cur.y + dy },
          };
        });
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      }
    } else if (isPanningRef.current) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (draggingNodeRef.current) {
      const id = draggingNodeRef.current;
      if (!hasDraggedRef.current) {
        setSelectedEntityId(id);
      }
      draggingNodeRef.current = null;
    }
    isPanningRef.current = false;
  };

  // Jump from History list
  const jumpToMilestone = (m: ReplayMilestone) => {
    setCurrentTime(m.timeSec);
    setSelectedEntityId(m.primaryEntityId);
  };

  // Currently selected entity data
  const selectedEntity = INITIAL_DEMO_NODES[selectedEntityId] || INITIAL_DEMO_NODES["wallet-A"];
  const isSelectedWatched = watchlist.includes(selectedEntity.id);
  const isSelectedFollowed = followedWalletId === selectedEntity.id;

  return (
    <div
      ref={rootContainerRef}
      className="w-full rounded-xl border border-[#D7DAD8] bg-[#FAFAF8] text-[#202322] overflow-hidden shadow-xs font-sans selection:bg-[#202322] selection:text-white"
    >
      {/* 1. TOP HEADER & MANDATORY RECORDED SAMPLE LABEL */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-white border-b border-[#D7DAD8] text-xs font-mono">
        <div className="flex items-center gap-2.5 text-[#202322]">
          <Activity className="size-4 text-[#059669]" />
          <span className="font-bold text-[#202322] tracking-tight">WAKE OBSERVATION TERMINAL</span>
          <span className="text-[#D7DAD8]">|</span>
          <span className="text-[#6B716E] hidden sm:inline">Transaction Flow Motion Replay</span>
        </div>

        {/* MANDATORY PROMINENT BADGE */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold text-[11px]">
          <span className="size-2 rounded-full bg-[#D97706]" />
          <span>RECORDED SAMPLE · NOT A LIVE MARKET FEED</span>
        </div>
      </div>

      {/* 2. MAIN 2D OBSERVATION INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">

        {/* LEFT / CENTER: LIGHT NEUTRAL TECHNICAL 2D GRAPH (col-span-8) */}
        <div
          ref={canvasWrapperRef}
          className="lg:col-span-8 relative bg-[#F1F3F2] flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#D7DAD8] overscroll-contain touch-none select-none"
        >

          {/* Interactive HUD Overlay */}
          <div className="absolute top-3.5 left-4 z-10 flex items-center gap-2 text-[11px] font-mono pointer-events-none">
            <span className="bg-white/95 text-[#202322] border border-[#D7DAD8] px-2.5 py-1 rounded shadow-2xs">
              Phase: {currentMilestone.title}
            </span>
            {followedWalletId && (
              <span className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-2.5 py-1 rounded shadow-2xs flex items-center gap-1.5 font-bold">
                <Crosshair className="size-3 text-[#2563EB]" />
                Following: {INITIAL_DEMO_NODES[followedWalletId]?.sublabel}
              </span>
            )}
          </div>

          {/* Zoom and Camera Controls */}
          <div className="absolute top-3.5 right-4 z-10 flex items-center gap-1 bg-white/95 border border-[#D7DAD8] rounded p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              className="p-1 rounded text-[#6B716E] hover:text-[#202322] hover:bg-[#F1F3F2] transition-colors cursor-pointer"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              className="p-1 rounded text-[#6B716E] hover:text-[#202322] hover:bg-[#F1F3F2] transition-colors cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <div className="w-px h-3.5 bg-[#D7DAD8] mx-0.5" />
            <button
              type="button"
              onClick={handleResetView}
              className="px-2 py-0.5 text-[11px] font-mono text-[#6B716E] hover:text-[#202322] hover:bg-[#F1F3F2] rounded transition-colors cursor-pointer"
              title="Reset View Position"
            >
              Reset View
            </button>
          </div>

          {/* 2D SVG OBSERVATION CANVAS */}
          <svg
            aria-label="Wake 2D On-Chain Observation Graph"
            className="w-full h-[400px] sm:h-[460px] lg:h-full cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              {/* Refined Small Subtle Dot Matrix Grid (Bintik Samar Kecil) */}
              <pattern id="wake-v3-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="11" cy="11" r="1.1" fill="#94A3B8" opacity="0.6" />
              </pattern>

              {/* Edge Arrows */}
              <marker
                id="marker-arrow-idle"
                viewBox="0 0 10 10"
                refX="25"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94A3B8" />
              </marker>

              <marker
                id="marker-arrow-active"
                viewBox="0 0 10 10"
                refX="25"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#D97706" />
              </marker>

              <marker
                id="marker-arrow-transfer"
                viewBox="0 0 10 10"
                refX="25"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563EB" />
              </marker>
            </defs>

            {/* Base Canvas Surface */}
            <rect width="100%" height="100%" fill="#F1F3F2" />

            {/* Transform Group (with Infinite Spatial Dot Grid that pans/zooms with canvas) */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

              {/* Dynamic Subtle Dot Matrix Pattern */}
              <rect x="-8000" y="-8000" width="16000" height="16000" fill="url(#wake-v3-dots)" pointerEvents="none" />

              {/* EDGES: Gradual Discovery (Section 3) & Directional Path */}
              {SAMPLE_DEMO_EDGES.map((edge) => {
                if (currentTime < edge.appearTime) return null;
                const sPos = nodePositions[edge.source];
                const tPos = nodePositions[edge.target];
                if (!sPos || !tPos) return null;

                // Section 3: Gradual entrance opacity
                const edgeDiscoveryProgress = Math.min(1, Math.max(0, (currentTime - edge.appearTime) / 0.45));
                const isCurrentActive = currentMilestone.activeEdgeIds.includes(edge.id);
                const isTransfer = edge.kind === "TRANSFER";

                let strokeColor = "#94A3B8";
                let strokeWidth = 1.6;
                let markerId = "marker-arrow-idle";

                if (isCurrentActive) {
                  strokeColor = isTransfer ? "#2563EB" : "#D97706";
                  strokeWidth = 2.6;
                  markerId = isTransfer ? "marker-arrow-transfer" : "marker-arrow-active";
                } else if (isTransfer) {
                  strokeColor = "#3B82F6";
                  strokeWidth = 2;
                  markerId = "marker-arrow-transfer";
                }

                // Curved path for the direct transfer link (Wallet A -> Wallet B)
                const isDirectWalletTransfer = edge.source === "wallet-A" && edge.target === "wallet-B";
                const midX = (sPos.x + tPos.x) / 2;
                const midY = isDirectWalletTransfer ? sPos.y - 32 : (sPos.y + tPos.y) / 2;

                const pathData = isDirectWalletTransfer
                  ? `M ${sPos.x} ${sPos.y} Q ${midX} ${sPos.y - 48} ${tPos.x} ${tPos.y}`
                  : `M ${sPos.x} ${sPos.y} L ${tPos.x} ${tPos.y}`;

                return (
                  <g key={edge.id} opacity={edgeDiscoveryProgress}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isCurrentActive && !prefersReducedMotion ? "6 4" : isTransfer ? "4 3" : "none"}
                      strokeDashoffset={isCurrentActive && !prefersReducedMotion ? -currentTime * 24 : 0}
                      markerEnd={`url(#${markerId})`}
                    />
                    {/* Edge Label Badge */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-52"
                        y="-10"
                        width="104"
                        height="20"
                        rx="4"
                        fill="#FFFFFF"
                        stroke={isCurrentActive ? strokeColor : "#D7DAD8"}
                        strokeWidth="1"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={isCurrentActive ? strokeColor : "#6B716E"}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {edge.label}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* MOVING ASSET FLOW MARKERS (Sections 4, 5, 6, 7, 8, 9) */}
              {!prefersReducedMotion &&
                activeMovingMarkers.map((marker) => (
                  <g key={marker.id} transform={`translate(${marker.x}, ${marker.y})`} className="pointer-events-none">
                    {marker.kind === "token" ? (
                      <g>
                        {/* Token X Asset Indicator */}
                        <circle
                          r="11"
                          fill="#FFFFFF"
                          stroke="#D97706"
                          strokeWidth="2.2"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill="#92400E"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          X
                        </text>
                        <g transform="translate(13, -8)">
                          <rect
                            x="0"
                            y="0"
                            width="48"
                            height="16"
                            rx="3"
                            fill="#FFFFFF"
                            stroke="#D97706"
                            strokeWidth="0.8"
                            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                          />
                          <text
                            x="24"
                            y="11"
                            textAnchor="middle"
                            fill="#92400E"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            TOKEN X
                          </text>
                        </g>
                      </g>
                    ) : (
                      <g>
                        {/* Neutral Payment Indicator */}
                        <circle
                          r="9"
                          fill="#F8FAFC"
                          stroke="#64748B"
                          strokeWidth="2"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        />
                        <circle cx="0" cy="0" r="3" fill="#475569" />
                        <g transform="translate(12, -7)">
                          <rect
                            x="0"
                            y="0"
                            width="44"
                            height="15"
                            rx="3"
                            fill="#FFFFFF"
                            stroke="#94A3B8"
                            strokeWidth="0.8"
                            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                          />
                          <text
                            x="22"
                            y="10.5"
                            textAnchor="middle"
                            fill="#475569"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="600"
                          >
                            payment
                          </text>
                        </g>
                      </g>
                    )}
                  </g>
                ))}

              {/* NODES: Instant 1:1 Unified Movement with zero delay and distinct shapes */}
              {Object.values(INITIAL_DEMO_NODES).map((node) => {
                if (currentTime < node.discoveryTime) return null;
                const pos = nodePositions[node.id] || { x: node.initialX, y: node.initialY };

                const discoveryProgress = Math.min(1, Math.max(0, (currentTime - node.discoveryTime) / 0.45));
                const nodeScale = 0.94 + 0.06 * discoveryProgress;
                const nodeOpacity = discoveryProgress;

                const isSelected = selectedEntityId === node.id;
                const isFollowed = followedWalletId === node.id;
                const isWatched = watchlist.includes(node.id);
                const visualState = getNodeVisualState(node.id);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y}) scale(${nodeScale})`}
                    opacity={nodeOpacity}
                    onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                    className="cursor-move group"
                    style={{ willChange: "transform" }}
                  >
                    {/* Settlement acknowledgment ring (Section 11) */}
                    {visualState === "SETTLED" && (
                      <circle
                        r="38"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Active transaction halo ring (Section 11) */}
                    {(visualState === "TRANSACTION" || isFollowed) && (
                      <circle
                        r="38"
                        fill="none"
                        stroke={isFollowed ? "#2563EB" : "#D97706"}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* SHAPE 1: WALLET ENTITY (Rounded Rectangle with address and wallet icon) */}
                    {node.type === "wallet" && (
                      <g>
                        <rect
                          x="-64"
                          y="-25"
                          width="128"
                          height="50"
                          rx="8"
                          fill="#FFFFFF"
                          stroke={
                            isSelected
                              ? "#202322"
                              : visualState === "SETTLED"
                              ? "#059669"
                              : visualState === "TRANSACTION"
                              ? "#D97706"
                              : isFollowed
                              ? "#2563EB"
                              : "#D7DAD8"
                          }
                          strokeWidth={isSelected || isFollowed || visualState === "TRANSACTION" ? "2.5" : "1.5"}
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
                        />
                        {/* Icon & Label */}
                        <g transform="translate(-50, -12)">
                          <circle cx="6" cy="6" r="6" fill={isWatched ? "#ECFDF5" : "#F4F4F5"} />
                          <circle cx="6" cy="6" r="2.5" fill={isWatched ? "#059669" : "#71717A"} />
                        </g>
                        <text
                          x="-32"
                          y="-3"
                          fill="#202322"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {node.label}
                        </text>
                        <text
                          x="-32"
                          y="13"
                          fill="#6B716E"
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          {node.sublabel}
                        </text>
                        {isWatched && (
                          <rect
                            x="22"
                            y="-18"
                            width="36"
                            height="12"
                            rx="2"
                            fill="#ECFDF5"
                            stroke="#A7F3D0"
                            strokeWidth="0.8"
                          />
                        )}
                        {isWatched && (
                          <text
                            x="40"
                            y="-9"
                            textAnchor="middle"
                            fill="#065F46"
                            fontSize="7.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            WATCH
                          </text>
                        )}
                      </g>
                    )}

                    {/* SHAPE 2: TOKEN ASSET (Distinct Hexagonal Polygon) */}
                    {node.type === "token" && (
                      <g>
                        {/* Hexagon Path */}
                        <polygon
                          points="0,-34 50,-17 50,17 0,34 -50,17 -50,-17"
                          fill="#FFFFFF"
                          stroke={
                            isSelected
                              ? "#202322"
                              : visualState === "SETTLED"
                              ? "#059669"
                              : visualState === "TRANSACTION"
                              ? "#D97706"
                              : "#202322"
                          }
                          strokeWidth={isSelected || visualState === "TRANSACTION" ? "2.8" : "2"}
                          filter="drop-shadow(0 3px 6px rgba(0,0,0,0.08))"
                        />
                        <text
                          x="0"
                          y="-5"
                          textAnchor="middle"
                          fill="#202322"
                          fontSize="12.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          letterSpacing="0.05em"
                        >
                          {node.label}
                        </text>
                        <text
                          x="0"
                          y="11"
                          textAnchor="middle"
                          fill="#6B716E"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {node.sublabel}
                        </text>
                      </g>
                    )}

                    {/* SHAPE 3: POOL INFRASTRUCTURE (Distinct Diamond / Quieter Node) */}
                    {node.type === "pool" && (
                      <g>
                        {/* Diamond Shape */}
                        <polygon
                          points="0,-28 46,0 0,28 -46,0"
                          fill="#F8FAFC"
                          stroke={
                            isSelected
                              ? "#202322"
                              : visualState === "SETTLED"
                              ? "#059669"
                              : visualState === "TRANSACTION"
                              ? "#D97706"
                              : "#94A3B8"
                          }
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                          filter="drop-shadow(0 1px 3px rgba(0,0,0,0.04))"
                        />
                        <text
                          x="0"
                          y="-2"
                          textAnchor="middle"
                          fill="#334155"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {node.label}
                        </text>
                        <text
                          x="0"
                          y="10"
                          textAnchor="middle"
                          fill="#64748B"
                          fontSize="7.5"
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

          {/* Canvas Bottom Legend / Instructions */}
          <div className="px-5 py-2.5 bg-white border-t border-[#D7DAD8] text-[11px] font-mono text-[#6B716E] flex flex-wrap items-center justify-between gap-3">
            <span>Visual Grammar: <strong>Rectangles</strong> = Accounts · <strong>Hexagons</strong> = Assets · <strong>Diamonds</strong> = Pools</span>
            <span className="text-[#A1A1AA]">Drag nodes to reposition · Drag canvas to pan</span>
          </div>
        </div>

        {/* RIGHT: EVIDENCE, INSPECTION & INFLOW PANEL (col-span-4) */}
        <div className="lg:col-span-4 bg-[#FAFAF8] p-4 flex flex-col justify-between overflow-y-auto max-h-[620px]">
          <div className="space-y-3.5">

            {/* Panel Tabs: History vs Inflow */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D7DAD8] rounded-lg font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-1.5 rounded text-center transition-colors cursor-pointer font-bold ${
                  activeTab === "history"
                    ? "bg-[#202322] text-white shadow-2xs"
                    : "text-[#6B716E] hover:text-[#202322] hover:bg-[#F1F3F2]"
                }`}
              >
                OBSERVED HISTORY
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("inflow")}
                className={`flex-1 py-1.5 rounded text-center transition-colors cursor-pointer font-bold ${
                  activeTab === "inflow"
                    ? "bg-[#202322] text-white shadow-2xs"
                    : "text-[#6B716E] hover:text-[#202322] hover:bg-[#F1F3F2]"
                }`}
              >
                INFLOW OVERVIEW
              </button>
            </div>

            {/* TAB 1: OBSERVED HISTORY & ENTITY DETAIL */}
            {activeTab === "history" && (
              <>
                {/* ENTITY DETAIL CARD (Sections 13 & 14) */}
                <div className="p-3.5 bg-white rounded-lg border border-[#D7DAD8] shadow-2xs font-mono">
                  {/* Entity Type Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B716E]">
                      {selectedEntity.type === "wallet"
                        ? "WALLET"
                        : selectedEntity.type === "token"
                        ? "TOKEN"
                        : "POOL INFRASTRUCTURE"}
                    </span>
                    <button
                      type="button"
                      onClick={() => focusNode(selectedEntity.id)}
                      className="text-[10px] text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                      title="Center node in canvas"
                    >
                      <Crosshair className="size-3" />
                      <span>Center</span>
                    </button>
                  </div>

                  {/* Primary Identifier */}
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-base font-bold text-[#202322] tracking-tight">
                      {selectedEntity.type === "wallet" ? selectedEntity.sublabel : selectedEntity.label}
                    </span>
                    {selectedEntity.type === "wallet" && isSelectedWatched && (
                      <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[9.5px] font-bold">
                        WATCHED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#6B716E] mb-2 font-medium">
                    {selectedEntity.type === "wallet" ? selectedEntity.label : selectedEntity.sublabel}
                  </div>

                  {/* Contextual Flow / Description */}
                  {selectedEntity.type === "token" ? (
                    <div className="mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B716E] block mb-1">
                        OBSERVED FLOW
                      </span>
                      <div className="flex items-center justify-between bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0] text-xs font-bold text-[#202322]">
                        <span>Wallet A</span>
                        <ArrowRight className="size-3 text-[#94A3B8]" />
                        <span className="text-[#D97706]">Token X</span>
                        <ArrowRight className="size-3 text-[#94A3B8]" />
                        <span className="text-[#2563EB]">Wallet B</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#6B716E] leading-relaxed mb-2.5">
                      {selectedEntity.roleDescription}
                    </p>
                  )}

                  {/* OBSERVED ACTIVITY (Sections 13 & 14) */}
                  <div className="mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B716E] block mb-1">
                      OBSERVED ACTIVITY
                    </span>
                    <div className="space-y-1 font-mono text-[10.5px]">
                      {selectedEntity.observedActivity.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-[#F8FAFC] px-2 py-1 rounded border border-[#E2E8F0]"
                        >
                          <span className="text-[#64748B]">{act.time}</span>
                          <span
                            className={`font-bold ${
                              act.action === "BUY"
                                ? "text-[#059669]"
                                : act.action === "SELL"
                                ? "text-[#DC2626]"
                                : "text-[#2563EB]"
                            }`}
                          >
                            {act.action}
                          </span>
                          <span className="text-[#334155] font-medium">{act.asset}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RELATED ENTITIES */}
                  <div className="mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B716E] block mb-1">
                      RELATED ENTITIES
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                      {selectedEntity.relatedEntityIds.map((rId) => {
                        const rNode = INITIAL_DEMO_NODES[rId];
                        if (!rNode) return null;
                        return (
                          <button
                            key={rId}
                            type="button"
                            onClick={() => setSelectedEntityId(rId)}
                            className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F3F2] border border-[#D7DAD8] hover:border-[#6B716E] text-[#202322] cursor-pointer"
                          >
                            {rNode.label} ({rNode.sublabel})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons for Wallet Entities */}
                  {selectedEntity.type === "wallet" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#D7DAD8]">
                      <button
                        type="button"
                        onClick={() => toggleWatchlist(selectedEntity.id)}
                        className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                          isSelectedWatched
                            ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                            : "bg-white hover:bg-[#F1F3F2] text-[#202322] border-[#D7DAD8]"
                        }`}
                      >
                        {isSelectedWatched ? (
                          <>
                            <BookmarkCheck className="size-3 text-[#059669]" />
                            <span>In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="size-3 text-[#6B716E]" />
                            <span>Add to Watchlist</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleFollow(selectedEntity.id)}
                        className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                          isSelectedFollowed
                            ? "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]"
                            : "bg-white hover:bg-[#F1F3F2] text-[#202322] border-[#D7DAD8]"
                        }`}
                      >
                        <Crosshair className="size-3" />
                        <span>{isSelectedFollowed ? "Unfollow" : "Follow Wallet"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* CHRONOLOGICAL OBSERVED HISTORY LIST with Smooth Reveal & Settlement (Section 10) */}
                <div className="font-mono text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B716E]">
                      OBSERVED HISTORY
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">Click row to focus</span>
                  </div>

                  <div className="space-y-1.5">
                    {REPLAY_MILESTONES.slice(1).map((m) => {
                      const isCurrent = currentMilestone.id === m.id;
                      const isSettled = currentTime >= m.settleTime;
                      const isRecentSettlement = isSettled && currentTime <= m.settleTime + 1.2;
                      const isStarted = currentTime >= m.timeSec;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => jumpToMilestone(m)}
                          className={`w-full text-left p-2.5 rounded border transition-all duration-300 cursor-pointer ${
                            isRecentSettlement
                              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46] shadow-xs"
                              : isCurrent
                              ? "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] shadow-2xs font-semibold"
                              : isSettled
                              ? "bg-white border-[#D7DAD8] hover:border-[#6B716E] text-[#202322]"
                              : isStarted
                              ? "bg-white/80 border-[#E2E8F0] text-[#334155]"
                              : "bg-white/35 border-[#E5E7EB] text-[#9CA3AF] opacity-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-[11px] flex items-center gap-1.5">
                              <span
                                className={`size-1.5 rounded-full ${
                                  m.action === "BUY"
                                    ? "bg-[#059669]"
                                    : m.action === "SELL"
                                    ? "bg-[#DC2626]"
                                    : "bg-[#2563EB]"
                                }`}
                              />
                              {m.timeLabel} {m.action}
                            </span>
                            <span className="text-[10px] font-semibold text-[#6B716E]">
                              {m.timecode}
                            </span>
                          </div>
                          <div className="text-[10.5px] font-bold text-[#334155] pl-3">
                            TOKEN X
                          </div>
                          <div className="text-[10px] text-[#6B716E] pl-3">
                            via {m.venueLabel}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: COMPACT INFLOW OVERVIEW (Section 15) */}
            {activeTab === "inflow" && (
              <div className="space-y-3 font-mono">
                <div className="p-3.5 bg-white rounded-lg border border-[#D7DAD8] shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B716E]">
                      INFLOW
                    </span>
                    <span className="text-[10px] text-[#059669] font-bold">DERIVED SAMPLE</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="flex items-center justify-between font-bold text-[#202322] mb-1">
                        <span>TOKEN X</span>
                        <span className="text-[10px] text-[#059669] font-semibold">observed activity</span>
                      </div>
                      <p className="text-[10.5px] text-[#6B716E] leading-relaxed">
                        Pons V2 mint orders → Inter-wallet transfer (Wallet A → Wallet B) → Secondary v4 liquidity exit.
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="flex items-center justify-between font-bold text-[#202322] mb-1">
                        <span>TOKEN Y</span>
                        <span className="text-[10px] text-[#6B716E] font-semibold">observed activity</span>
                      </div>
                      <p className="text-[10.5px] text-[#6B716E] leading-relaxed">
                        Bonding curve deployments on secondary Robinhood Chain block window.
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#A1A1AA] mt-3 leading-relaxed">
                    Zero fabricated metrics. Volumes, USD quotes, and fake PnL percentages are strictly omitted from local observation.
                  </p>
                </div>

                {/* Narrative Summary Box */}
                <div className="p-3 bg-white rounded-lg border border-[#D7DAD8] text-[11px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B716E] block mb-1">
                    OBSERVED SEQUENCE
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#202322] py-1">
                    <span>Wallet A</span>
                    <ArrowRight className="size-3 text-[#A1A1AA]" />
                    <span className="text-[#D97706]">Token X</span>
                    <ArrowRight className="size-3 text-[#A1A1AA]" />
                    <span className="text-[#2563EB]">Wallet B</span>
                    <ArrowRight className="size-3 text-[#A1A1AA]" />
                    <span className="text-[#DC2626]">v4 Pool</span>
                  </div>
                  <p className="text-[10px] text-[#6B716E] mt-1 font-mono">
                    Pattern: <code>BUY → BUY → TRANSFER → SELL</code>
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Current Event Footnote */}
          <div className="mt-3 pt-2.5 border-t border-[#D7DAD8] font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-[#D97706] font-bold mb-0.5">
              <Clock className="size-3" />
              <span>CURRENT OBSERVED EVENT</span>
            </div>
            <p className="text-[#202322] font-bold">{currentMilestone.title}</p>
            <p className="text-[10px] text-[#6B716E] leading-relaxed mt-0.5">
              {currentMilestone.summary}
            </p>
          </div>
        </div>

      </div>

      {/* 3. WATCHLIST STORY BAR (Section 9) */}
      <div className="px-5 py-2.5 bg-white border-t border-[#D7DAD8] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#6B716E] uppercase text-[10px]">
            <BookmarkCheck className="size-3.5 text-[#059669]" />
            <span>WATCHLIST:</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wallet A in Watchlist */}
            <div
              onClick={() => setSelectedEntityId("wallet-A")}
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] border cursor-pointer transition-colors ${
                selectedEntityId === "wallet-A"
                  ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] font-bold"
                  : "bg-[#F4F4F5] text-[#202322] border-[#D7DAD8] hover:border-[#6B716E]"
              }`}
            >
              <span className="size-1.5 rounded-full bg-[#059669]" />
              <span className="font-bold">0x71...4A2</span>
              <span className="text-[#6B716E]">Wallet A</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-white border border-[#D7DAD8] text-[#475569]">
                3 observed events
              </span>
            </div>

            {/* Wallet B in Watchlist if added */}
            {watchlist.includes("wallet-B") ? (
              <div
                onClick={() => setSelectedEntityId("wallet-B")}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] border cursor-pointer transition-colors ${
                  selectedEntityId === "wallet-B"
                    ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] font-bold"
                    : "bg-[#F4F4F5] text-[#202322] border-[#D7DAD8] hover:border-[#6B716E]"
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#059669]" />
                <span className="font-bold">0x92...81C</span>
                <span className="text-[#6B716E]">Wallet B</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-white border border-[#D7DAD8] text-[#475569]">
                  2 observed events
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toggleWatchlist("wallet-B")}
                className="text-[10px] text-[#6B716E] hover:text-[#202322] underline cursor-pointer"
              >
                + Add Wallet B (0x92...81C)
              </button>
            )}
          </div>
        </div>

        <div className="text-[11px] text-[#6B716E] hidden sm:flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-[#059669]" />
          <span>Zero RPC calls · Zero external network traffic</span>
        </div>
      </div>

      {/* 4. TIMELINE SCRUBBER & REPLAY CONTROLS */}
      <div className="p-4 bg-[#F1F3F2] border-t border-[#D7DAD8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        {/* Play / Pause / Reset Replay */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 px-4 rounded bg-[#202322] hover:bg-black text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label={isPlaying ? "Pause replay" : "Start replay"}
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>{currentTime >= TOTAL_TIMELINE_DURATION ? "Replay" : "Play"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetReplay}
            className="h-8 px-3 rounded bg-white hover:bg-[#E5E7EB] text-[#202322] border border-[#D7DAD8] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset replay timeline to 00:00"
          >
            <RotateCcw className="size-3 text-[#6B716E]" />
            <span>Reset Replay</span>
          </button>
        </div>

        {/* Timeline Slider with Timestamps */}
        <div className="flex-1 flex items-center gap-3 w-full">
          <span className="text-[11px] text-[#202322] font-bold shrink-0">
            {`00:${String(Math.floor(currentTime)).padStart(2, "0")}`}
          </span>

          <input
            type="range"
            min="0"
            max={TOTAL_TIMELINE_DURATION}
            step="0.05"
            value={currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            aria-label="Replay timeline scrubber"
            className="w-full accent-[#202322] cursor-pointer h-2 bg-[#D7DAD8] rounded-lg appearance-none"
          />

          <span className="text-[11px] text-[#6B716E] font-semibold shrink-0">
            00:20
          </span>
        </div>
      </div>
    </div>
  );
}
