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
  settleTime: number;
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
    if (currentTime >= 11.6 && currentTime <= 14.4) {
      const p = easeInOutCubic((currentTime - 11.6) / 2.8);
      const ctrlX = (posA.x + posB.x) / 2;
      const ctrlY = posA.y - 48;
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

  // Node Pointer Down (Drag Node) - 1:1 Instant synchronicity with lines
  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    draggingNodeRef.current = nodeId;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    initialClickPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  // Pointer Move - seamless movement without CSS transition delays
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
      style={{
        width: "100%",
        borderRadius: "12px",
        border: "1px solid #D7DAD8",
        backgroundColor: "#FAFAF8",
        color: "#202322",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* 1. TOP HEADER & MANDATORY RECORDED SAMPLE LABEL */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.75rem 1.25rem",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #D7DAD8",
          fontSize: "0.75rem",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", color: "#202322" }}>
          <Activity style={{ width: "1rem", height: "1rem", color: "#059669" }} />
          <span style={{ fontWeight: 700, color: "#202322", letterSpacing: "-0.01em" }}>
            WAKE OBSERVATION TERMINAL
          </span>
          <span style={{ color: "#D7DAD8" }}>|</span>
          <span style={{ color: "#6B716E" }}>Transaction Flow Motion Replay</span>
        </div>

        {/* MANDATORY PROMINENT BADGE */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "4px",
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            border: "1px solid #FDE68A",
            fontWeight: 700,
            fontSize: "0.6875rem",
          }}
        >
          <span
            style={{
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "50%",
              backgroundColor: "#D97706",
            }}
          />
          <span>RECORDED SAMPLE · NOT A LIVE MARKET FEED</span>
        </div>
      </div>

      {/* 2. MAIN 2D OBSERVATION INTERFACE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          minHeight: "500px",
        }}
      >
        {/* LEFT / CENTER: LIGHT NEUTRAL TECHNICAL 2D GRAPH */}
        <div
          ref={canvasWrapperRef}
          style={{
            position: "relative",
            backgroundColor: "#F1F3F2",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            borderRight: "1px solid #D7DAD8",
            overscrollBehavior: "contain",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          {/* Interactive HUD Overlay */}
          <div
            style={{
              position: "absolute",
              top: "0.875rem",
              left: "1rem",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.6875rem",
              fontFamily: "var(--font-mono)",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                color: "#202322",
                border: "1px solid #D7DAD8",
                padding: "0.25rem 0.625rem",
                borderRadius: "4px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              Phase: {currentMilestone.title}
            </span>
            {followedWalletId && (
              <span
                style={{
                  backgroundColor: "#EFF6FF",
                  color: "#1E40AF",
                  border: "1px solid #BFDBFE",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontWeight: 700,
                }}
              >
                <Crosshair style={{ width: "0.75rem", height: "0.75rem", color: "#2563EB" }} />
                Following: {INITIAL_DEMO_NODES[followedWalletId]?.sublabel}
              </span>
            )}
          </div>

          {/* Zoom and Camera Controls */}
          <div
            style={{
              position: "absolute",
              top: "0.875rem",
              right: "1rem",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #D7DAD8",
              borderRadius: "4px",
              padding: "0.25rem",
            }}
          >
            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              style={{
                background: "none",
                border: "none",
                color: "#6B716E",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
              }}
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn style={{ width: "0.875rem", height: "0.875rem" }} />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              style={{
                background: "none",
                border: "none",
                color: "#6B716E",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
              }}
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut style={{ width: "0.875rem", height: "0.875rem" }} />
            </button>
            <div style={{ width: "1px", height: "0.875rem", backgroundColor: "#D7DAD8", margin: "0 0.125rem" }} />
            <button
              type="button"
              onClick={handleResetView}
              style={{
                background: "none",
                border: "none",
                color: "#6B716E",
                fontSize: "0.6875rem",
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                padding: "0.125rem 0.5rem",
              }}
              title="Reset View Position"
            >
              Reset View
            </button>
          </div>

          {/* 2D SVG OBSERVATION CANVAS */}
          <svg
            aria-label="Wake 2D On-Chain Observation Graph"
            style={{
              width: "100%",
              height: "460px",
              cursor: "grab",
              userSelect: "none",
            }}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              {/* Refined Small Subtle Dot Matrix Grid (Bintik Samar Kecil) */}
              <pattern id="web-v3-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="11" cy="11" r="1.1" fill="#94A3B8" opacity="0.6" />
              </pattern>

              {/* Edge Arrows */}
              <marker
                id="web-v3-arrow-idle"
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
                id="web-v3-arrow-active"
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
                id="web-v3-arrow-transfer"
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

            {/* Transform Group (with Infinite Spatial Dot Grid) */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

              {/* Subtle Dot Grid that pans/zooms with canvas */}
              <rect x="-8000" y="-8000" width="16000" height="16000" fill="url(#web-v3-dots)" pointerEvents="none" />

              {/* EDGES: Gradual Discovery (Section 3) & Directional Path */}
              {SAMPLE_DEMO_EDGES.map((edge) => {
                if (currentTime < edge.appearTime) return null;
                const sPos = nodePositions[edge.source];
                const tPos = nodePositions[edge.target];
                if (!sPos || !tPos) return null;

                const edgeDiscoveryProgress = Math.min(1, Math.max(0, (currentTime - edge.appearTime) / 0.45));
                const isCurrentActive = currentMilestone.activeEdgeIds.includes(edge.id);
                const isTransfer = edge.kind === "TRANSFER";

                let strokeColor = "#94A3B8";
                let strokeWidth = 1.6;
                let markerId = "web-v3-arrow-idle";

                if (isCurrentActive) {
                  strokeColor = isTransfer ? "#2563EB" : "#D97706";
                  strokeWidth = 2.6;
                  markerId = isTransfer ? "web-v3-arrow-transfer" : "web-v3-arrow-active";
                } else if (isTransfer) {
                  strokeColor = "#3B82F6";
                  strokeWidth = 2;
                  markerId = "web-v3-arrow-transfer";
                }

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
                  <g key={marker.id} transform={`translate(${marker.x}, ${marker.y})`} style={{ pointerEvents: "none" }}>
                    {marker.kind === "token" ? (
                      <g>
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
                    style={{ cursor: "move", willChange: "transform" }}
                  >
                    {/* Settlement acknowledgment ring (Section 11) */}
                    {visualState === "SETTLED" && (
                      <circle
                        r="38"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2"
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
          <div
            style={{
              padding: "0.625rem 1.25rem",
              backgroundColor: "#FFFFFF",
              borderTop: "1px solid #D7DAD8",
              fontSize: "0.6875rem",
              fontFamily: "var(--font-mono)",
              color: "#6B716E",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <span>Visual Grammar: <strong>Rectangles</strong> = Accounts · <strong>Hexagons</strong> = Assets · <strong>Diamonds</strong> = Pools</span>
            <span style={{ color: "#A1A1AA" }}>Drag nodes to reposition · Drag canvas to pan</span>
          </div>
        </div>

        {/* RIGHT: EVIDENCE, INSPECTION & INFLOW PANEL */}
        <div
          style={{
            backgroundColor: "#FAFAF8",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflowY: "auto",
            maxHeight: "620px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

            {/* Panel Tabs: History vs Inflow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.25rem",
                backgroundColor: "#FFFFFF",
                border: "1px solid #D7DAD8",
                borderRadius: "8px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                style={{
                  flex: 1,
                  padding: "0.375rem",
                  borderRadius: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  fontWeight: 700,
                  border: "none",
                  backgroundColor: activeTab === "history" ? "#202322" : "transparent",
                  color: activeTab === "history" ? "#FFFFFF" : "#6B716E",
                }}
              >
                OBSERVED HISTORY
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("inflow")}
                style={{
                  flex: 1,
                  padding: "0.375rem",
                  borderRadius: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  fontWeight: 700,
                  border: "none",
                  backgroundColor: activeTab === "inflow" ? "#202322" : "transparent",
                  color: activeTab === "inflow" ? "#FFFFFF" : "#6B716E",
                }}
              >
                INFLOW OVERVIEW
              </button>
            </div>

            {/* TAB 1: OBSERVED HISTORY & ENTITY DETAIL */}
            {activeTab === "history" && (
              <>
                {/* ENTITY DETAIL CARD (Sections 13 & 14) */}
                <div
                  style={{
                    padding: "0.875rem",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #D7DAD8",
                    fontFamily: "var(--font-mono)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Entity Type Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B716E" }}>
                      {selectedEntity.type === "wallet"
                        ? "WALLET"
                        : selectedEntity.type === "token"
                        ? "TOKEN"
                        : "POOL INFRASTRUCTURE"}
                    </span>
                    <button
                      type="button"
                      onClick={() => focusNode(selectedEntity.id)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "0.625rem",
                        color: "#2563EB",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: 0,
                      }}
                      title="Center node in canvas"
                    >
                      <Crosshair style={{ width: "0.75rem", height: "0.75rem" }} />
                      <span>Center</span>
                    </button>
                  </div>

                  {/* Primary Identifier */}
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "#202322", letterSpacing: "-0.01em" }}>
                      {selectedEntity.type === "wallet" ? selectedEntity.sublabel : selectedEntity.label}
                    </span>
                    {selectedEntity.type === "wallet" && isSelectedWatched && (
                      <span style={{ padding: "0.125rem 0.5rem", borderRadius: "4px", backgroundColor: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", fontSize: "0.625rem", fontWeight: 700 }}>
                        WATCHED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6B716E", marginBottom: "0.5rem", fontWeight: 500 }}>
                    {selectedEntity.type === "wallet" ? selectedEntity.label : selectedEntity.sublabel}
                  </div>

                  {/* Contextual Flow / Description */}
                  {selectedEntity.type === "token" ? (
                    <div style={{ marginBottom: "0.625rem" }}>
                      <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B716E", display: "block", marginBottom: "0.25rem" }}>
                        OBSERVED FLOW
                      </span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", padding: "0.5rem", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "0.75rem", fontWeight: 700, color: "#202322" }}>
                        <span>Wallet A</span>
                        <ArrowRight style={{ width: "0.75rem", height: "0.75rem", color: "#94A3B8" }} />
                        <span style={{ color: "#D97706" }}>Token X</span>
                        <ArrowRight style={{ width: "0.75rem", height: "0.75rem", color: "#94A3B8" }} />
                        <span style={{ color: "#2563EB" }}>Wallet B</span>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.6875rem", color: "#6B716E", lineHeight: 1.5, marginBottom: "0.625rem" }}>
                      {selectedEntity.roleDescription}
                    </p>
                  )}

                  {/* OBSERVED ACTIVITY (Sections 13 & 14) */}
                  <div style={{ marginBottom: "0.625rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B716E", display: "block", marginBottom: "0.25rem" }}>
                      OBSERVED ACTIVITY
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
                      {selectedEntity.observedActivity.map((act, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#F8FAFC",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <span style={{ color: "#64748B" }}>{act.time}</span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: act.action === "BUY" ? "#059669" : act.action === "SELL" ? "#DC2626" : "#2563EB",
                            }}
                          >
                            {act.action}
                          </span>
                          <span style={{ color: "#334155", fontWeight: 500 }}>{act.asset}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RELATED ENTITIES */}
                  <div style={{ marginBottom: "0.625rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B716E", display: "block", marginBottom: "0.25rem" }}>
                      RELATED ENTITIES
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", fontFamily: "var(--font-mono)", fontSize: "0.625rem" }}>
                      {selectedEntity.relatedEntityIds.map((rId) => {
                        const rNode = INITIAL_DEMO_NODES[rId];
                        if (!rNode) return null;
                        return (
                          <button
                            key={rId}
                            type="button"
                            onClick={() => setSelectedEntityId(rId)}
                            style={{
                              padding: "0.125rem 0.5rem",
                              borderRadius: "4px",
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #D7DAD8",
                              color: "#202322",
                              cursor: "pointer",
                            }}
                          >
                            {rNode.label} ({rNode.sublabel})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons for Wallet Entities */}
                  {selectedEntity.type === "wallet" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #D7DAD8" }}>
                      <button
                        type="button"
                        onClick={() => toggleWatchlist(selectedEntity.id)}
                        style={{
                          flex: 1,
                          padding: "0.375rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.6875rem",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.375rem",
                          cursor: "pointer",
                          backgroundColor: isSelectedWatched ? "#ECFDF5" : "#FFFFFF",
                          color: isSelectedWatched ? "#065F46" : "#202322",
                          border: isSelectedWatched ? "1px solid #A7F3D0" : "1px solid #D7DAD8",
                        }}
                      >
                        {isSelectedWatched ? (
                          <>
                            <BookmarkCheck style={{ width: "0.75rem", height: "0.75rem", color: "#059669" }} />
                            <span>In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <Bookmark style={{ width: "0.75rem", height: "0.75rem", color: "#6B716E" }} />
                            <span>Add to Watchlist</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleFollow(selectedEntity.id)}
                        style={{
                          flex: 1,
                          padding: "0.375rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.6875rem",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.375rem",
                          cursor: "pointer",
                          backgroundColor: isSelectedFollowed ? "#EFF6FF" : "#FFFFFF",
                          color: isSelectedFollowed ? "#1E40AF" : "#202322",
                          border: isSelectedFollowed ? "1px solid #BFDBFE" : "1px solid #D7DAD8",
                        }}
                      >
                        <Crosshair style={{ width: "0.75rem", height: "0.75rem" }} />
                        <span>{isSelectedFollowed ? "Unfollow" : "Follow Wallet"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* CHRONOLOGICAL OBSERVED HISTORY LIST with Smooth Reveal & Settlement (Section 10) */}
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B716E" }}>
                      OBSERVED HISTORY
                    </span>
                    <span style={{ fontSize: "0.625rem", color: "#A1A1AA" }}>Click row to focus</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
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
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "0.625rem",
                            borderRadius: "6px",
                            border: isRecentSettlement
                              ? "1px solid #A7F3D0"
                              : isCurrent
                              ? "1px solid #FDE68A"
                              : isSettled
                              ? "1px solid #D7DAD8"
                              : isStarted
                              ? "1px solid #E2E8F0"
                              : "1px solid #E5E7EB",
                            backgroundColor: isRecentSettlement
                              ? "#ECFDF5"
                              : isCurrent
                              ? "#FEF3C7"
                              : isSettled
                              ? "#FFFFFF"
                              : isStarted
                              ? "rgba(255, 255, 255, 0.8)"
                              : "rgba(255, 255, 255, 0.4)",
                            color: isRecentSettlement
                              ? "#065F46"
                              : isCurrent
                              ? "#92400E"
                              : isSettled
                              ? "#202322"
                              : isStarted
                              ? "#334155"
                              : "#9CA3AF",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.125rem" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.6875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                              <span
                                style={{
                                  width: "0.375rem",
                                  height: "0.375rem",
                                  borderRadius: "50%",
                                  backgroundColor: m.action === "BUY" ? "#059669" : m.action === "SELL" ? "#DC2626" : "#2563EB",
                                }}
                              />
                              {m.timeLabel} {m.action}
                            </span>
                            <span style={{ fontSize: "0.625rem", fontWeight: 600, color: "#6B716E" }}>
                              {m.timecode}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#334155", paddingLeft: "0.75rem" }}>
                            TOKEN X
                          </div>
                          <div style={{ fontSize: "0.625rem", color: "#6B716E", paddingLeft: "0.75rem" }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontFamily: "var(--font-mono)" }}>
                <div style={{ padding: "0.875rem", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #D7DAD8", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B716E" }}>
                      INFLOW
                    </span>
                    <span style={{ fontSize: "0.625rem", color: "#059669", fontWeight: 700 }}>DERIVED SAMPLE</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem" }}>
                    <div style={{ padding: "0.625rem", borderRadius: "6px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, color: "#202322", marginBottom: "0.25rem" }}>
                        <span>TOKEN X</span>
                        <span style={{ fontSize: "0.625rem", color: "#059669", fontWeight: 600 }}>observed activity</span>
                      </div>
                      <p style={{ fontSize: "0.65rem", color: "#6B716E", lineHeight: 1.5, margin: 0 }}>
                        Pons V2 mint orders → Inter-wallet transfer (Wallet A → Wallet B) → Secondary v4 liquidity exit.
                      </p>
                    </div>

                    <div style={{ padding: "0.625rem", borderRadius: "6px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, color: "#202322", marginBottom: "0.25rem" }}>
                        <span>TOKEN Y</span>
                        <span style={{ fontSize: "0.625rem", color: "#6B716E", fontWeight: 600 }}>observed activity</span>
                      </div>
                      <p style={{ fontSize: "0.65rem", color: "#6B716E", lineHeight: 1.5, margin: 0 }}>
                        Bonding curve deployments on secondary Robinhood Chain block window.
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.625rem", color: "#A1A1AA", marginTop: "0.75rem", lineHeight: 1.5, margin: "0.75rem 0 0 0" }}>
                    Zero fabricated metrics. Volumes, USD quotes, and fake PnL percentages are strictly omitted from local observation.
                  </p>
                </div>

                {/* Narrative Summary Box */}
                <div style={{ padding: "0.75rem", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #D7DAD8", fontSize: "0.6875rem" }}>
                  <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B716E", display: "block", marginBottom: "0.25rem" }}>
                    OBSERVED SEQUENCE
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "#202322", padding: "0.25rem 0" }}>
                    <span>Wallet A</span>
                    <ArrowRight style={{ width: "0.75rem", height: "0.75rem", color: "#A1A1AA" }} />
                    <span style={{ color: "#D97706" }}>Token X</span>
                    <ArrowRight style={{ width: "0.75rem", height: "0.75rem", color: "#A1A1AA" }} />
                    <span style={{ color: "#2563EB" }}>Wallet B</span>
                    <ArrowRight style={{ width: "0.75rem", height: "0.75rem", color: "#A1A1AA" }} />
                    <span style={{ color: "#DC2626" }}>v4 Pool</span>
                  </div>
                  <p style={{ fontSize: "0.625rem", color: "#6B716E", marginTop: "0.25rem", fontFamily: "var(--font-mono)", margin: "0.25rem 0 0 0" }}>
                    Pattern: <code>BUY → BUY → TRANSFER → SELL</code>
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Current Event Footnote */}
          <div style={{ marginTop: "0.75rem", paddingTop: "0.625rem", borderTop: "1px solid #D7DAD8", fontFamily: "var(--font-mono)", fontSize: "0.6875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#D97706", fontWeight: 700, marginBottom: "0.125rem" }}>
              <Clock style={{ width: "0.75rem", height: "0.75rem" }} />
              <span>CURRENT OBSERVED EVENT</span>
            </div>
            <p style={{ color: "#202322", fontWeight: 700, margin: 0 }}>{currentMilestone.title}</p>
            <p style={{ fontSize: "0.625rem", color: "#6B716E", lineHeight: 1.5, marginTop: "0.125rem", margin: "0.125rem 0 0 0" }}>
              {currentMilestone.summary}
            </p>
          </div>
        </div>

      </div>

      {/* 3. WATCHLIST STORY BAR (Section 9) */}
      <div
        style={{
          padding: "0.625rem 1.25rem",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #D7DAD8",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          fontSize: "0.75rem",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 700, color: "#6B716E", textTransform: "uppercase", fontSize: "0.625rem" }}>
            <BookmarkCheck style={{ width: "0.875rem", height: "0.875rem", color: "#059669" }} />
            <span>WATCHLIST:</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Wallet A in Watchlist */}
            <div
              onClick={() => setSelectedEntityId("wallet-A")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.25rem 0.625rem",
                borderRadius: "4px",
                fontSize: "0.6875rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: selectedEntityId === "wallet-A" ? "#ECFDF5" : "#F4F4F5",
                color: selectedEntityId === "wallet-A" ? "#065F46" : "#202322",
                border: selectedEntityId === "wallet-A" ? "1px solid #A7F3D0" : "1px solid #D7DAD8",
                fontWeight: selectedEntityId === "wallet-A" ? 700 : 500,
              }}
            >
              <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", backgroundColor: "#059669" }} />
              <span style={{ fontWeight: 700 }}>0x71...4A2</span>
              <span style={{ color: "#6B716E" }}>Wallet A</span>
              <span style={{ fontSize: "0.6rem", padding: "0.0625rem 0.375rem", borderRadius: "3px", backgroundColor: "#FFFFFF", border: "1px solid #D7DAD8", color: "#475569" }}>
                3 observed events
              </span>
            </div>

            {/* Wallet B in Watchlist if added */}
            {watchlist.includes("wallet-B") ? (
              <div
                onClick={() => setSelectedEntityId("wallet-B")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "4px",
                  fontSize: "0.6875rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  backgroundColor: selectedEntityId === "wallet-B" ? "#ECFDF5" : "#F4F4F5",
                  color: selectedEntityId === "wallet-B" ? "#065F46" : "#202322",
                  border: selectedEntityId === "wallet-B" ? "1px solid #A7F3D0" : "1px solid #D7DAD8",
                  fontWeight: selectedEntityId === "wallet-B" ? 700 : 500,
                }}
              >
                <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", backgroundColor: "#059669" }} />
                <span style={{ fontWeight: 700 }}>0x92...81C</span>
                <span style={{ color: "#6B716E" }}>Wallet B</span>
                <span style={{ fontSize: "0.6rem", padding: "0.0625rem 0.375rem", borderRadius: "3px", backgroundColor: "#FFFFFF", border: "1px solid #D7DAD8", color: "#475569" }}>
                  2 observed events
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toggleWatchlist("wallet-B")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.625rem",
                  color: "#6B716E",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                + Add Wallet B (0x92...81C)
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: "0.6875rem", color: "#6B716E", display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <ShieldCheck style={{ width: "0.875rem", height: "0.875rem", color: "#059669" }} />
          <span>Zero RPC calls · Zero external network traffic</span>
        </div>
      </div>

      {/* 4. TIMELINE SCRUBBER & REPLAY CONTROLS */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#F1F3F2",
          borderTop: "1px solid #D7DAD8",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
        }}
      >
        {/* Play / Pause / Reset Replay */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              height: "2rem",
              padding: "0 1rem",
              borderRadius: "4px",
              backgroundColor: "#202322",
              color: "#FFFFFF",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              cursor: "pointer",
              border: "none",
            }}
            aria-label={isPlaying ? "Pause replay" : "Start replay"}
          >
            {isPlaying ? (
              <>
                <Pause style={{ width: "0.875rem", height: "0.875rem", fill: "currentColor" }} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play style={{ width: "0.875rem", height: "0.875rem", fill: "currentColor" }} />
                <span>{currentTime >= TOTAL_TIMELINE_DURATION ? "Replay" : "Play"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetReplay}
            style={{
              height: "2rem",
              padding: "0 0.75rem",
              borderRadius: "4px",
              backgroundColor: "#FFFFFF",
              color: "#202322",
              border: "1px solid #D7DAD8",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              cursor: "pointer",
            }}
            title="Reset replay timeline to 00:00"
          >
            <RotateCcw style={{ width: "0.75rem", height: "0.75rem", color: "#6B716E" }} />
            <span>Reset Replay</span>
          </button>
        </div>

        {/* Timeline Slider with Timestamps */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "200px" }}>
          <span style={{ fontSize: "0.6875rem", color: "#202322", fontWeight: 700, flexShrink: 0 }}>
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
            style={{
              width: "100%",
              cursor: "pointer",
              height: "0.5rem",
              accentColor: "#202322",
              backgroundColor: "#D7DAD8",
              borderRadius: "4px",
            }}
          />

          <span style={{ fontSize: "0.6875rem", color: "#6B716E", fontWeight: 600, flexShrink: 0 }}>
            00:20
          </span>
        </div>
      </div>
    </div>
  );
}
