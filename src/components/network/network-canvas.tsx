"use client";

import {
  Info,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  DEMO_LINKS,
  DEMO_ROTATION_OBSERVATIONS,
  DEMO_TOKENS,
  DEMO_WALLETS,
} from "./demo-data";
import {
  TokenNode,
  WalletNode
} from "./network-types";

// Pristine, deterministic, zero-collision neat layout coordinates for first load
export const INITIAL_NEAT_POSITIONS: Record<string, { x: number; y: number }> = {
  // Tokens (spatially separated landmarks)
  "token-PON": { x: -210, y: 0 },
  "token-RHO": { x: 210, y: 0 },
  "token-MIRA": { x: 90, y: 170 },
  "token-KITE": { x: -290, y: 155 },
  "token-WAVE": { x: -190, y: -160 },

  // Wallets - Central Corridor (PON -> RHO: 3 parallel lanes cleanly separated)
  "wallet-0x7A91": { x: 0, y: 52 },
  "wallet-0x91CE": { x: 0, y: 0 },
  "wallet-0x4F21": { x: 0, y: -52 },

  // Wallets - Diagonal Corridor (MIRA -> RHO cascade)
  "wallet-0xB72C": { x: 135, y: 115 },
  "wallet-0xE209": { x: 175, y: 65 },

  // Wallet - KITE -> PON Corridor
  "wallet-0x5C33": { x: -250, y: 80 },

  // Wallet - PON -> WAVE Corridor
  "wallet-0x18AE": { x: -200, y: -80 },

  // Wallet - WAVE -> MIRA Corridor
  "wallet-0x88D2": { x: -55, y: -115 },
};

interface NetworkCanvasProps {
  selectedPair: { fromToken: string; toToken: string } | null;
  selectedWalletAddress: string | null;
  onSelectPair: (pair: { fromToken: string; toToken: string } | null) => void;
  onSelectWallet: (address: string | null) => void;
  isProofOpen: boolean;
  onToggleProof: () => void;
}

export function NetworkCanvas({
  selectedPair,
  selectedWalletAddress,
  onSelectPair,
  onSelectWallet,
  isProofOpen,
  onToggleProof,
}: NetworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Replay & Animation State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [replaySpeed, setReplaySpeed] = useState<1 | 10 | 20>(10);
  const [currentObsIndex, setCurrentObsIndex] = useState<number>(0);
  const [hoveredInfo, setHoveredInfo] = useState<{
    type: "token" | "wallet" | "link";
    title: string;
    subtitle: string;
    details: string[];
    x: number;
    y: number;
  } | null>(null);

  // Smooth Zoom & Pan interpolation states
  const zoomStateRef = useRef({
    current: 1.0,
    target: 1.0,
  });

  const panStateRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
  });

  // Free Dragging State for Individual Nodes (Tokens & Wallets)
  const nodeDragRef = useRef<{
    isDragging: boolean;
    mesh: THREE.Mesh | null;
    nodeData: (TokenNode | WalletNode) | null;
    offset: { x: number; y: number };
    startClientX: number;
    startClientY: number;
    hasMoved: boolean;
  }>({
    isDragging: false,
    mesh: null,
    nodeData: null,
    offset: { x: 0, y: 0 },
    startClientX: 0,
    startClientY: 0,
    hasMoved: false,
  });

  // Three.js References
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    nodesGroup: THREE.Group;
    linksGroup: THREE.Group;
    pulseGroup: THREE.Group;
    gridGroup: THREE.Group;
    nodeMeshes: Map<string, THREE.Mesh>;
    linkMeshes: Map<string, THREE.Line | THREE.Mesh>;
    pulseMesh: THREE.Mesh;
    pulseHalo: THREE.Mesh;
    pulseRing: THREE.Mesh;
    rafId: number | null;
    simulationNodes: (TokenNode | WalletNode)[];
  } | null>(null);

  // Live Progress Track DOM ref for 60fps smooth playback progress bar
  const progressTrackRef = useRef<HTMLDivElement>(null);

  // Active observation ref for animation loop
  const activeObsRef = useRef<{
    index: number;
    progress: number;
    isPlaying: boolean;
    speed: number;
  }>({
    index: 0,
    progress: 0,
    isPlaying: true,
    speed: 10,
  });

  // Keep ref updated
  useEffect(() => {
    activeObsRef.current.isPlaying = isPlaying;
    activeObsRef.current.speed = replaySpeed;
    activeObsRef.current.index = currentObsIndex;
  }, [isPlaying, replaySpeed, currentObsIndex]);

  // Ultra High-DPI Token Texture generator (512x512 canvas: Sleek dark metallic/obsidian disc with specular ring and crisp typography)
  const createTokenTexture = useCallback(
    (symbol: string, isSelected: boolean, isDimmed: boolean) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, 512, 512);

      const cx = 256;
      const cy = 256;
      const radius = 216;

      if (isDimmed) {
        // Dimmed State: Clean, subtle muted disc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#f1f5f9";
        ctx.fill();

        ctx.lineWidth = 6;
        ctx.strokeStyle = "#cbd5e1";
        ctx.stroke();

        ctx.font = "bold 112px -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(symbol, cx, cy - 8);

        ctx.font = "bold 34px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("TOKEN", cx, cy + 82);
      } else if (isSelected) {
        // Selected State: Radiant Amber / Gold Precision Coin with Luminous Glow
        // Outer soft glow aura
        const glowGradient = ctx.createRadialGradient(cx, cy, radius - 20, cx, cy, radius + 30);
        glowGradient.addColorStop(0, "rgba(245, 158, 11, 0.45)");
        glowGradient.addColorStop(0.7, "rgba(245, 158, 11, 0.15)");
        glowGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 28, 0, Math.PI * 2);
        ctx.fill();

        // Drop shadow
        ctx.shadowColor = "rgba(217, 119, 6, 0.4)";
        ctx.shadowBlur = 36;
        ctx.shadowOffsetY = 12;

        // Gradient Disc Fill (Deep obsidian to rich slate)
        const discGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        discGrad.addColorStop(0, "#1e293b");
        discGrad.addColorStop(1, "#090d16");
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = discGrad;
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = "transparent";

        // Double Precision Accent Border
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#f59e0b";
        ctx.stroke();

        // Inner glowing ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 20, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(254, 240, 138, 0.7)";
        ctx.stroke();

        // Symbol Text - Radiant warm gold
        ctx.font = "bold 120px -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fef08a";
        ctx.fillText(symbol, cx, cy - 10);

        // Sleek Capsule Tag
        ctx.fillStyle = "rgba(245, 158, 11, 0.22)";
        ctx.beginPath();
        ctx.roundRect(cx - 80, cy + 62, 160, 48, 24);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
        ctx.stroke();

        ctx.font = "bold 32px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = "#fef08a";
        ctx.fillText("TOKEN", cx, cy + 86);
      } else {
        // Normal State: Ultra-Modern Obsidian Coin with Specular Edge
        // Ambient drop shadow for soft elevation
        ctx.shadowColor = "rgba(15, 23, 42, 0.18)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 10;

        // Disc Gradient
        const discGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        discGrad.addColorStop(0, "#1e293b");
        discGrad.addColorStop(0.55, "#0f172a");
        discGrad.addColorStop(1, "#020617");
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = discGrad;
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = "transparent";

        // Hairline Precision Border
        ctx.lineWidth = 7;
        ctx.strokeStyle = "#334155";
        ctx.stroke();

        // Specular inner edge highlight
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 16, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.stroke();

        // Symbol Text - Clean crisp pure white
        ctx.font = "bold 118px -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(symbol, cx, cy - 10);

        // Sleek Capsule Tag
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.beginPath();
        ctx.roundRect(cx - 74, cy + 62, 148, 46, 23);
        ctx.fill();

        ctx.font = "bold 30px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
        ctx.fillText("TOKEN", cx, cy + 85);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    },
    []
  );

  // Ultra High-DPI Wallet Texture generator (720x228 or 960x420 for focused card: Crisp modern cryptographic card)
  const createWalletTexture = useCallback(
    (
      shortAddress: string,
      isFocused: boolean,
      isDimmed: boolean,
      rotationSummary?: string
    ) => {
      const canvas = document.createElement("canvas");
      if (isFocused) {
        canvas.width = 960;
        canvas.height = 420;
      } else {
        canvas.width = 720;
        canvas.height = 228;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const r = 28;

      if (isFocused) {
        // Focused Wallet: High-End Technical Identity Card
        // Soft warm elevation shadow
        ctx.shadowColor = "rgba(217, 119, 6, 0.28)";
        ctx.shadowBlur = 32;
        ctx.shadowOffsetY = 12;

        // Card Body
        ctx.beginPath();
        ctx.roundRect(14, 14, w - 28, h - 28, r);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = "transparent";

        // Accent border
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#f59e0b";
        ctx.stroke();

        // Header Banner
        ctx.fillStyle = "#fffbeb";
        ctx.beginPath();
        ctx.roundRect(19, 19, w - 38, 96, [r, r, 0, 0]);
        ctx.fill();

        // Divider
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(19, 115);
        ctx.lineTo(w - 19, 115);
        ctx.stroke();

        // Top Label: OBSERVED WALLET
        ctx.font = "bold 38px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = "#b45309";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("OBSERVED WALLET", 48, 68);

        // CLEAN Verified Badge inside header
        ctx.fillStyle = "#ecfdf5";
        ctx.beginPath();
        ctx.roundRect(w - 230, 36, 182, 58, 14);
        ctx.fill();
        ctx.strokeStyle = "#a7f3d0";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = "bold 32px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = "#047857";
        ctx.textAlign = "center";
        ctx.fillText("CLEAN", w - 139, 66);

        // Monospace Address - crisp high-contrast
        ctx.font = "bold 68px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = "#0f172a";
        ctx.textAlign = "left";
        ctx.fillText(shortAddress, 48, 206);

        // Rotation Details Pill
        ctx.font = "bold 38px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = "#334155";
        ctx.fillText(rotationSummary || "Observed rotation active", 48, 298);

        // Footer Metadata
        ctx.font = "600 30px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Match Window 15m · Robinhood Chain Log", 48, 368);
      } else {
        // Compact Wallet Pill
        // Ambient soft shadow
        ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;

        ctx.beginPath();
        ctx.roundRect(14, 14, w - 28, h - 28, r);
        ctx.fillStyle = isDimmed ? "#f8fafc" : "#ffffff";
        ctx.fill();

        ctx.shadowColor = "transparent";

        // Thin precision border
        ctx.lineWidth = 5;
        ctx.strokeStyle = isDimmed ? "#e2e8f0" : "#cbd5e1";
        ctx.stroke();

        // Sleek cryptographic avatar dot (outer ring + inner core)
        const avX = 72;
        const avY = h / 2;
        ctx.beginPath();
        ctx.arc(avX, avY, 22, 0, Math.PI * 2);
        ctx.fillStyle = isDimmed ? "#e2e8f0" : "#f1f5f9";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(avX, avY, 11, 0, Math.PI * 2);
        ctx.fillStyle = isDimmed ? "#94a3b8" : "#0f172a";
        ctx.fill();

        // Address text - crisp mono dark
        ctx.font = "bold 56px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isDimmed ? "#94a3b8" : "#0f172a";
        ctx.fillText(shortAddress, 116, h / 2 - 2);

        // "WLT" tag badge on the right
        ctx.fillStyle = isDimmed ? "#f1f5f9" : "#f8fafc";
        ctx.beginPath();
        ctx.roundRect(w - 156, h / 2 - 32, 116, 64, 16);
        ctx.fill();
        ctx.strokeStyle = isDimmed ? "#e2e8f0" : "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = "bold 30px 'SF Mono', Monaco, Menlo, Consolas, monospace";
        ctx.fillStyle = isDimmed ? "#94a3b8" : "#64748b";
        ctx.textAlign = "center";
        ctx.fillText("WLT", w - 98, h / 2);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    },
    []
  );

  // Initialize Three.js scene & d3-force-3d simulation
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene with Architectural Clean Background (0xf8fafc)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    // 2. Camera: Orthographic with high frustum for crisp 2D presentation
    const aspect = width / height;
    const frustumSize = 640;
    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      2000
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer with High DPI
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));

    // Groups
    const gridGroup = new THREE.Group();
    const linksGroup = new THREE.Group();
    const nodesGroup = new THREE.Group();
    const pulseGroup = new THREE.Group();

    scene.add(gridGroup);
    scene.add(linksGroup);
    scene.add(nodesGroup);
    scene.add(pulseGroup);

    // 4. Ultra-Modern Dual-Density Precision Dot Grid (Figma / Linear / CAD Style)
    const gridExtent = 1200;
    const dotPoints: THREE.Vector3[] = [];
    for (let x = -gridExtent; x <= gridExtent; x += 28) {
      for (let y = -gridExtent; y <= gridExtent; y += 28) {
        dotPoints.push(new THREE.Vector3(x, y, -2));
      }
    }
    const dotGeo = new THREE.BufferGeometry().setFromPoints(dotPoints);
    const dotMat = new THREE.PointsMaterial({
      color: 0xcbd5e1,
      size: 1.8,
      transparent: true,
      opacity: 0.55,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    gridGroup.add(dots);

    // Modern CAD Crosshair Ticks at major 140px intersections (replaces noisy long lines)
    const crosshairLines: THREE.Vector3[] = [];
    const tickLen = 5;
    for (let x = -gridExtent; x <= gridExtent; x += 140) {
      for (let y = -gridExtent; y <= gridExtent; y += 140) {
        crosshairLines.push(new THREE.Vector3(x - tickLen, y, -1.8));
        crosshairLines.push(new THREE.Vector3(x + tickLen, y, -1.8));
        crosshairLines.push(new THREE.Vector3(x, y - tickLen, -1.8));
        crosshairLines.push(new THREE.Vector3(x, y + tickLen, -1.8));
      }
    }
    const crosshairTickGeo = new THREE.BufferGeometry().setFromPoints(crosshairLines);
    const crosshairTickMat = new THREE.LineSegments(
      crosshairTickGeo,
      new THREE.LineBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.4,
      })
    );
    gridGroup.add(crosshairTickMat);

    // Center Coordinate Origin Datum Mark (Concentric ring + fine crosshair)
    const centerRingGeo = new THREE.RingGeometry(20, 21.5, 48);
    const centerRingMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const centerRing = new THREE.Mesh(centerRingGeo, centerRingMat);
    centerRing.position.set(0, 0, -1);
    gridGroup.add(centerRing);

    const centerCrosshairPoints = [
      new THREE.Vector3(-28, 0, 0),
      new THREE.Vector3(28, 0, 0),
      new THREE.Vector3(0, -28, 0),
      new THREE.Vector3(0, 28, 0),
    ];
    const centerCrosshairGeo = new THREE.BufferGeometry().setFromPoints(centerCrosshairPoints);
    const centerCrosshairMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.6,
    });
    gridGroup.add(new THREE.LineSegments(centerCrosshairGeo, centerCrosshairMat));

    // 5. Deterministic Architectural Layout (Immaculate Neat Positioning on Initial Load)
    const simNodes: (TokenNode | WalletNode)[] = [
      ...DEMO_TOKENS.map((t) => {
        const pos = INITIAL_NEAT_POSITIONS[t.id];
        return {
          ...t,
          x: pos?.x ?? t.x,
          y: pos?.y ?? t.y,
        };
      }),
      ...DEMO_WALLETS.map((w) => {
        const pos = INITIAL_NEAT_POSITIONS[w.id];
        return {
          ...w,
          x: pos?.x ?? w.x,
          y: pos?.y ?? w.y,
        };
      }),
    ];

    // 6. Build Node Meshes
    const nodeMeshes = new Map<string, THREE.Mesh>();

    simNodes.forEach((node) => {
      if (node.type === "token") {
        const texture = createTokenTexture(node.symbol, false, false);
        const geo = new THREE.PlaneGeometry(node.radius * 2.2, node.radius * 2.2);
        const mat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(node.x || 0, node.y || 0, 10);
        mesh.userData = { id: node.id, type: "token", data: node };
        nodesGroup.add(mesh);
        nodeMeshes.set(node.id, mesh);
      } else {
        const texture = createWalletTexture(node.shortAddress, false, false);
        const geo = new THREE.PlaneGeometry(74, 24);
        const mat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(node.x || 0, node.y || 0, 10);
        mesh.userData = { id: node.id, type: "wallet", data: node };
        nodesGroup.add(mesh);
        nodeMeshes.set(node.id, mesh);
      }
    });

    // 7. Build Link Meshes with Directional Flow Indicators
    const linkMeshes = new Map<string, THREE.Line | THREE.Mesh>();

    DEMO_LINKS.forEach((link) => {
      const srcNode = simNodes.find(
        (n) => n.id === (typeof link.source === "object" ? (link.source as any).id : link.source)
      );
      const tgtNode = simNodes.find(
        (n) => n.id === (typeof link.target === "object" ? (link.target as any).id : link.target)
      );

      if (!srcNode || !tgtNode) return;

      const p1 = new THREE.Vector3(srcNode.x || 0, srcNode.y || 0, 2);
      const p2 = new THREE.Vector3(tgtNode.x || 0, tgtNode.y || 0, 2);

      const walletCount = link.walletCount;
      const isAggregated = link.kind === "token_to_token";

      // Color scheme for modern clean canvas
      const lineColor = isAggregated
        ? walletCount >= 3
          ? 0x475569 // prominent slate for thick 3+ wallets
          : 0x94a3b8 // muted slate
        : link.kind === "token_to_wallet"
          ? 0xf43f5e // sell leg: clean rose
          : 0x10b981; // buy leg: clean emerald

      const lineMat = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: isAggregated ? 0.5 : 0.35,
        linewidth: 1,
      });

      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData = { id: link.id, data: link, srcNode, tgtNode };
      linksGroup.add(line);
      linkMeshes.set(link.id, line);

      // Add subtle modern directional chevron
      const arrowGeo = new THREE.ConeGeometry(3, 7, 3);
      arrowGeo.rotateX(Math.PI / 2);
      const arrowMat = new THREE.MeshBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: isAggregated ? 0.6 : 0.7,
        depthWrite: false,
      });
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      const mid = new THREE.Vector3().lerpVectors(p1, p2, 0.55);
      arrow.position.set(mid.x, mid.y, 4);
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      arrow.rotation.z = angle - Math.PI / 2;
      line.userData.arrow = arrow;
      linksGroup.add(arrow);

      // Multi-wallet thick connection lines (e.g. PON -> RHO with 3 distinct wallets)
      if (walletCount >= 3 && isAggregated) {
        const normal = new THREE.Vector3(-(p2.y - p1.y), p2.x - p1.x, 0).normalize().multiplyScalar(3.5);
        const geo2 = new THREE.BufferGeometry().setFromPoints([
          p1.clone().add(normal),
          p2.clone().add(normal),
        ]);
        const line2 = new THREE.Line(geo2, lineMat.clone());
        linksGroup.add(line2);

        const geo3 = new THREE.BufferGeometry().setFromPoints([
          p1.clone().sub(normal),
          p2.clone().sub(normal),
        ]);
        const line3 = new THREE.Line(geo3, lineMat.clone());
        linksGroup.add(line3);

        line.userData.extraLines = [line2, line3];
      }
    });

    // 8. Replay Observation Dual-Core Glowing Pulse Entities
    const pulsePointGeo = new THREE.CircleGeometry(5, 24);
    const pulsePointMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pulseMesh = new THREE.Mesh(pulsePointGeo, pulsePointMat);
    pulseMesh.position.set(0, 0, 16);
    pulseGroup.add(pulseMesh);

    const pulseHaloGeo = new THREE.CircleGeometry(12, 24);
    const pulseHaloMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pulseHalo = new THREE.Mesh(pulseHaloGeo, pulseHaloMat);
    pulseHalo.position.set(0, 0, 15);
    pulseGroup.add(pulseHalo);

    const ringGeo = new THREE.RingGeometry(8, 11, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const pulseRing = new THREE.Mesh(ringGeo, ringMat);
    pulseRing.position.set(0, 0, 14);
    pulseGroup.add(pulseRing);

    threeRef.current = {
      renderer,
      scene,
      camera,
      nodesGroup,
      linksGroup,
      pulseGroup,
      gridGroup,
      nodeMeshes,
      linkMeshes,
      pulseMesh,
      pulseHalo,
      pulseRing,
      rafId: null,
      simulationNodes: simNodes,
    };

    // 9. Smooth Animation & Render Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = activeObsRef.current;
      const ref = threeRef.current;

      if (ref && state) {
        // --- Smooth Animated Zoom (Interpolation with ease-out) ---
        const zDiff = zoomStateRef.current.target - zoomStateRef.current.current;
        if (Math.abs(zDiff) > 0.0005) {
          zoomStateRef.current.current += zDiff * (1 - Math.exp(-delta * 14));
          ref.camera.zoom = zoomStateRef.current.current;
          ref.camera.updateProjectionMatrix();
        }

        // --- Smooth Animated Pan (Interpolation with momentum) ---
        const pDiffX = panStateRef.current.targetX - panStateRef.current.currentX;
        const pDiffY = panStateRef.current.targetY - panStateRef.current.currentY;
        if (Math.abs(pDiffX) > 0.05 || Math.abs(pDiffY) > 0.05) {
          panStateRef.current.currentX += pDiffX * (1 - Math.exp(-delta * 16));
          panStateRef.current.currentY += pDiffY * (1 - Math.exp(-delta * 16));
          ref.camera.position.x = -panStateRef.current.currentX;
          ref.camera.position.y = -panStateRef.current.currentY;
        }

        // --- Replay Advancement ---
        if (state.isPlaying) {
          const cycleDuration = state.speed === 1 ? 4.0 : state.speed === 10 ? 1.5 : 0.85;
          state.progress += delta / cycleDuration;

          if (state.progress >= 1.0) {
            state.progress = 0;
            state.index = (state.index + 1) % DEMO_ROTATION_OBSERVATIONS.length;
            setCurrentObsIndex(state.index);
          }
        }

        // Update live replay progress track for 60fps buttery smooth UI indicator
        if (progressTrackRef.current) {
          progressTrackRef.current.style.width = `${Math.min(Math.round(state.progress * 100), 100)}%`;
        }

        // Current active observation
        const obs = DEMO_ROTATION_OBSERVATIONS[state.index];
        const walletMesh = ref.nodeMeshes.get(obs.walletId);
        const tokenAMesh = ref.nodeMeshes.get(`token-${obs.fromToken}`);
        const tokenBMesh = ref.nodeMeshes.get(`token-${obs.toToken}`);

        if (walletMesh && tokenAMesh && tokenBMesh) {
          const tA = tokenAMesh.position;
          const wP = walletMesh.position;
          const tB = tokenBMesh.position;
          const p = state.progress;

          if (p < 0.15) {
            // Phase 1: Wallet radar ping
            const ringP = p / 0.15;
            ref.pulseRing.position.set(wP.x, wP.y, 14);
            const scale = 1 + ringP * 2.2;
            ref.pulseRing.scale.set(scale, scale, 1);
            (ref.pulseRing.material as THREE.MeshBasicMaterial).opacity = (1 - ringP) * 0.85;
            (ref.pulseRing.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
            (ref.pulseMesh.material as THREE.MeshBasicMaterial).opacity = 0;
            (ref.pulseHalo.material as THREE.MeshBasicMaterial).opacity = 0;
          } else if (p >= 0.15 && p < 0.45) {
            // Phase 2: Token A -> Wallet Sell line comet pulse
            const travel = (p - 0.15) / 0.3;
            const curX = tA.x + (wP.x - tA.x) * travel;
            const curY = tA.y + (wP.y - tA.y) * travel;
            ref.pulseMesh.position.set(curX, curY, 16);
            ref.pulseHalo.position.set(curX, curY, 15);
            (ref.pulseMesh.material as THREE.MeshBasicMaterial).opacity = 1;
            (ref.pulseMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e); // Sell rose
            (ref.pulseHalo.material as THREE.MeshBasicMaterial).opacity = 0.45;
            (ref.pulseHalo.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
            (ref.pulseRing.material as THREE.MeshBasicMaterial).opacity = 0;
          } else if (p >= 0.45 && p < 0.55) {
            // Phase 3: Wallet brief highlight
            ref.pulseRing.position.set(wP.x, wP.y, 14);
            const ringP = (p - 0.45) / 0.1;
            const scale = 1.1 + ringP * 1.6;
            ref.pulseRing.scale.set(scale, scale, 1);
            (ref.pulseRing.material as THREE.MeshBasicMaterial).opacity = (1 - ringP) * 0.8;
            (ref.pulseRing.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
            (ref.pulseMesh.material as THREE.MeshBasicMaterial).opacity = 0;
            (ref.pulseHalo.material as THREE.MeshBasicMaterial).opacity = 0;
          } else if (p >= 0.55 && p < 0.85) {
            // Phase 4: Wallet -> Token B Buy line comet pulse
            const travel = (p - 0.55) / 0.3;
            const curX = wP.x + (tB.x - wP.x) * travel;
            const curY = wP.y + (tB.y - wP.y) * travel;
            ref.pulseMesh.position.set(curX, curY, 16);
            ref.pulseHalo.position.set(curX, curY, 15);
            (ref.pulseMesh.material as THREE.MeshBasicMaterial).opacity = 1;
            (ref.pulseMesh.material as THREE.MeshBasicMaterial).color.setHex(0x10b981); // Buy emerald
            (ref.pulseHalo.material as THREE.MeshBasicMaterial).opacity = 0.45;
            (ref.pulseHalo.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
            (ref.pulseRing.material as THREE.MeshBasicMaterial).opacity = 0;
          } else if (p >= 0.85 && p < 0.95) {
            // Phase 5: Token B pulse
            const ringP = (p - 0.85) / 0.1;
            ref.pulseRing.position.set(tB.x, tB.y, 14);
            const scale = 1.3 + ringP * 2.4;
            ref.pulseRing.scale.set(scale, scale, 1);
            (ref.pulseRing.material as THREE.MeshBasicMaterial).opacity = (1 - ringP) * 0.85;
            (ref.pulseRing.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
            (ref.pulseMesh.material as THREE.MeshBasicMaterial).opacity = 0;
            (ref.pulseHalo.material as THREE.MeshBasicMaterial).opacity = 0;
          } else {
            // Phase 6: Settle
            (ref.pulseRing.material as THREE.MeshBasicMaterial).opacity = 0;
            (ref.pulseMesh.material as THREE.MeshBasicMaterial).opacity = 0;
            (ref.pulseHalo.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        }

        ref.renderer.render(ref.scene, ref.camera);
      }

      threeRef.current!.rafId = requestAnimationFrame(animate);
    };

    threeRef.current.rafId = requestAnimationFrame(animate);

    // 10. Responsive Resize Observer - Ensures Canvas Always Fits Perfectly
    const handleResize = () => {
      if (!container || !canvas || !threeRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 560;
      const asp = w / h;

      threeRef.current.camera.left = (-frustumSize * asp) / 2;
      threeRef.current.camera.right = (frustumSize * asp) / 2;
      threeRef.current.camera.top = frustumSize / 2;
      threeRef.current.camera.bottom = -frustumSize / 2;
      threeRef.current.camera.updateProjectionMatrix();

      threeRef.current.renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (threeRef.current?.rafId) {
        cancelAnimationFrame(threeRef.current.rafId);
      }
      renderer.dispose();
    };
  }, [createTokenTexture, createWalletTexture]);

  // Update visual textures & highlights when selection changes
  useEffect(() => {
    const ref = threeRef.current;
    if (!ref) return;

    ref.simulationNodes.forEach((node) => {
      const mesh = ref.nodeMeshes.get(node.id);
      if (!mesh) return;

      if (node.type === "token") {
        const isSelected =
          Boolean(selectedPair && (selectedPair.fromToken === node.symbol || selectedPair.toToken === node.symbol));
        const isDimmed =
          Boolean((selectedPair && selectedPair.fromToken !== node.symbol && selectedPair.toToken !== node.symbol) ||
            (selectedWalletAddress &&
              !DEMO_WALLETS.find((w) => w.address === selectedWalletAddress)?.primaryRotation?.fromToken.includes(
                node.symbol
              ) &&
              !DEMO_WALLETS.find((w) => w.address === selectedWalletAddress)?.primaryRotation?.toToken.includes(
                node.symbol
              )));

        const newTex = createTokenTexture(node.symbol, isSelected, isDimmed);
        const oldMat = mesh.material as THREE.MeshBasicMaterial;
        oldMat.map?.dispose();
        oldMat.map = newTex;
        oldMat.needsUpdate = true;
      } else {
        const isFocused =
          Boolean(selectedWalletAddress === node.address ||
            (selectedPair &&
              node.primaryRotation?.fromToken === selectedPair.fromToken &&
              node.primaryRotation?.toToken === selectedPair.toToken));

        const isDimmed =
          Boolean((selectedWalletAddress && selectedWalletAddress !== node.address) ||
            (selectedPair &&
              (node.primaryRotation?.fromToken !== selectedPair.fromToken ||
                node.primaryRotation?.toToken !== selectedPair.toToken)));

        let summary = "Observed rotation";
        if (node.primaryRotation) {
          summary = `sold ${node.primaryRotation.fromToken} → bought ${node.primaryRotation.toToken} (Δ ${node.primaryRotation.deltaMinutes}m)`;
        }

        const newTex = createWalletTexture(node.shortAddress, isFocused, isDimmed, summary);
        const oldMat = mesh.material as THREE.MeshBasicMaterial;
        oldMat.map?.dispose();
        oldMat.map = newTex;
        oldMat.needsUpdate = true;

        // Resize geometry for focused wallet card vs compact pill
        mesh.geometry.dispose();
        if (isFocused) {
          mesh.geometry = new THREE.PlaneGeometry(105, 46);
        } else {
          mesh.geometry = new THREE.PlaneGeometry(74, 24);
        }
      }
    });

    // Update link lines opacity & highlighting
    DEMO_LINKS.forEach((link) => {
      const lineMesh = ref.linkMeshes.get(link.id);
      if (!lineMesh) return;
      const mat = lineMesh.material as THREE.LineBasicMaterial;

      const isPairSelected =
        Boolean(selectedPair && link.fromToken === selectedPair.fromToken && link.toToken === selectedPair.toToken);
      const isWalletSelected =
        Boolean(selectedWalletAddress && link.walletAddress && link.walletAddress.includes(selectedWalletAddress.slice(0, 6)));

      if (isPairSelected || isWalletSelected) {
        mat.color.setHex(0xd97706); // prominent amber on white
        mat.opacity = 0.95;
      } else if (selectedPair || selectedWalletAddress) {
        mat.opacity = 0.12; // dim non-selected
        mat.color.setHex(0xcbd5e1);
      } else {
        if (link.kind === "token_to_token") {
          mat.color.setHex(link.walletCount >= 3 ? 0x475569 : 0x94a3b8);
          mat.opacity = 0.55;
        } else if (link.kind === "token_to_wallet") {
          mat.color.setHex(0xf43f5e);
          mat.opacity = 0.35;
        } else {
          mat.color.setHex(0x10b981);
          mat.opacity = 0.35;
        }
      }

      // Update directional arrow color on selection
      if (lineMesh.userData.arrow) {
        const arrowMat = lineMesh.userData.arrow.material as THREE.MeshBasicMaterial;
        if (isPairSelected || isWalletSelected) {
          arrowMat.color.setHex(0xd97706);
          arrowMat.opacity = 0.95;
        } else if (selectedPair || selectedWalletAddress) {
          arrowMat.color.setHex(0xcbd5e1);
          arrowMat.opacity = 0.15;
        } else {
          const isAgg = link.kind === "token_to_token";
          const col = isAgg ? 0x475569 : link.kind === "token_to_wallet" ? 0xf43f5e : 0x10b981;
          arrowMat.color.setHex(col);
          arrowMat.opacity = isAgg ? 0.6 : 0.7;
        }
      }
    });
  }, [selectedPair, selectedWalletAddress, createTokenTexture, createWalletTexture]);

  // Helper to dynamically update all connecting links in real-time when any node moves
  const updateLinkGeometries = useCallback(
    (linkMeshes: Map<string, THREE.Line | THREE.Mesh>) => {
      linkMeshes.forEach((lineMesh) => {
        const line = lineMesh as THREE.Line;
        const srcNode = line.userData.srcNode;
        const tgtNode = line.userData.tgtNode;
        if (!srcNode || !tgtNode) return;

        const p1 = new THREE.Vector3(srcNode.x || 0, srcNode.y || 0, 2);
        const p2 = new THREE.Vector3(tgtNode.x || 0, tgtNode.y || 0, 2);

        line.geometry.setFromPoints([p1, p2]);
        line.geometry.attributes.position.needsUpdate = true;

        // Update directional arrowhead position and angle
        if (line.userData.arrow) {
          const mid = new THREE.Vector3().lerpVectors(p1, p2, 0.55);
          line.userData.arrow.position.set(mid.x, mid.y, 4);
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          line.userData.arrow.rotation.z = angle - Math.PI / 2;
        }

        if (line.userData.extraLines) {
          const normal = new THREE.Vector3(-(p2.y - p1.y), p2.x - p1.x, 0)
            .normalize()
            .multiplyScalar(3.5);
          const line2 = line.userData.extraLines[0];
          const line3 = line.userData.extraLines[1];
          if (line2 && line3) {
            line2.geometry.setFromPoints([
              p1.clone().add(normal),
              p2.clone().add(normal),
            ]);
            line3.geometry.setFromPoints([
              p1.clone().sub(normal),
              p2.clone().sub(normal),
            ]);
            line2.geometry.attributes.position.needsUpdate = true;
            line3.geometry.attributes.position.needsUpdate = true;
          }
        }
      });
    },
    []
  );

  // Pointer Interaction: Free Node Dragging & Smooth Canvas Navigation
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ref = threeRef.current;
    if (!canvas || !ref) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const ndcX = (mouseX / rect.width) * 2 - 1;
    const ndcY = -(mouseY / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), ref.camera);

    const intersects = raycaster.intersectObjects(Array.from(ref.nodeMeshes.values()));

    if (intersects.length > 0) {
      // User clicked directly on a node -> initiate free dragging of this token/wallet!
      const hit = intersects[0].object as THREE.Mesh;
      const node = hit.userData.data as TokenNode | WalletNode;

      const worldPos = new THREE.Vector3(ndcX, ndcY, 0).unproject(ref.camera);

      nodeDragRef.current = {
        isDragging: true,
        mesh: hit,
        nodeData: node,
        offset: {
          x: hit.position.x - worldPos.x,
          y: hit.position.y - worldPos.y,
        },
        startClientX: e.clientX,
        startClientY: e.clientY,
        hasMoved: false,
      };

      // Lift node forward in 3D space while dragging
      hit.position.z = 25;

      canvas.style.cursor = "grabbing";
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    } else {
      // User clicked on empty background -> initiate canvas panning
      panStateRef.current.isDragging = true;
      panStateRef.current.dragStartX = mouseX;
      panStateRef.current.dragStartY = mouseY;
      canvas.style.cursor = "grabbing";
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ref = threeRef.current;
    if (!canvas || !ref) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 1. If currently dragging a specific node (Token or Wallet):
    if (nodeDragRef.current.isDragging && nodeDragRef.current.mesh && nodeDragRef.current.nodeData) {
      const ndcX = (mouseX / rect.width) * 2 - 1;
      const ndcY = -(mouseY / rect.height) * 2 + 1;

      const worldPos = new THREE.Vector3(ndcX, ndcY, 0).unproject(ref.camera);

      const newX = worldPos.x + nodeDragRef.current.offset.x;
      const newY = worldPos.y + nodeDragRef.current.offset.y;

      // Update Mesh & Data coordinates in real time
      nodeDragRef.current.mesh.position.x = newX;
      nodeDragRef.current.mesh.position.y = newY;

      nodeDragRef.current.nodeData.x = newX;
      nodeDragRef.current.nodeData.y = newY;

      const moveDist = Math.hypot(
        e.clientX - nodeDragRef.current.startClientX,
        e.clientY - nodeDragRef.current.startClientY
      );
      if (moveDist > 4) {
        nodeDragRef.current.hasMoved = true;
      }

      // Update all connecting link lines dynamically
      updateLinkGeometries(ref.linkMeshes);

      setHoveredInfo(null);
      return;
    }

    // 2. If currently panning canvas background:
    if (panStateRef.current.isDragging) {
      const dx = (mouseX - panStateRef.current.dragStartX) / zoomStateRef.current.current;
      const dy = (mouseY - panStateRef.current.dragStartY) / zoomStateRef.current.current;
      panStateRef.current.targetX += dx;
      panStateRef.current.targetY -= dy;
      panStateRef.current.dragStartX = mouseX;
      panStateRef.current.dragStartY = mouseY;
      return;
    }

    // 3. Hover Raycasting for Tooltip & Cursor state
    const ndcX = (mouseX / rect.width) * 2 - 1;
    const ndcY = -(mouseY / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), ref.camera);

    const intersects = raycaster.intersectObjects(Array.from(ref.nodeMeshes.values()));

    if (intersects.length > 0) {
      canvas.style.cursor = "grab";
      const hit = intersects[0].object;
      const data = hit.userData.data;

      if (hit.userData.type === "token") {
        const token = data as TokenNode;
        setHoveredInfo({
          type: "token",
          title: `TOKEN · ${token.symbol}`,
          subtitle: token.name,
          details: [
            `DEX: ${token.dex}`,
            `Inflow: ${token.inflowWallets} wallets`,
            `Outflow: ${token.outflowWallets} wallets`,
            `Drag anywhere to customize layout`,
          ],
          x: mouseX + 16,
          y: mouseY + 16,
        });
      } else {
        const wallet = data as WalletNode;
        setHoveredInfo({
          type: "wallet",
          title: `WALLET · ${wallet.shortAddress}`,
          subtitle: "Observed rotation history",
          details: [
            `Sold: ${wallet.primaryRotation?.fromToken} ($${wallet.primaryRotation?.amountSell})`,
            `Bought: ${wallet.primaryRotation?.toToken} ($${wallet.primaryRotation?.amountBuy})`,
            `Window: Δ ${wallet.primaryRotation?.deltaMinutes}m`,
            `Drag anywhere to customize layout`,
          ],
          x: mouseX + 16,
          y: mouseY + 16,
        });
      }
    } else {
      canvas.style.cursor = "default";
      setHoveredInfo(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ref = threeRef.current;
    if (!canvas || !ref) return;

    try {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    // 1. If was dragging a node:
    if (nodeDragRef.current.isDragging) {
      const wasMoved = nodeDragRef.current.hasMoved;
      const node = nodeDragRef.current.nodeData;

      if (nodeDragRef.current.mesh) {
        nodeDragRef.current.mesh.position.z = 10;
      }
      nodeDragRef.current.isDragging = false;
      nodeDragRef.current.mesh = null;
      nodeDragRef.current.nodeData = null;

      canvas.style.cursor = "grab";

      // If user merely clicked without moving, trigger selection:
      if (!wasMoved && node) {
        if (node.type === "wallet") {
          onSelectWallet(node.address);
          if (node.primaryRotation) {
            onSelectPair({
              fromToken: node.primaryRotation.fromToken,
              toToken: node.primaryRotation.toToken,
            });
          }
        } else if (node.type === "token") {
          if (node.symbol === "RHO" || node.symbol === "PON") {
            onSelectPair({ fromToken: "PON", toToken: "RHO" });
          } else if (node.symbol === "MIRA") {
            onSelectPair({ fromToken: "MIRA", toToken: "RHO" });
          } else if (node.symbol === "WAVE") {
            onSelectPair({ fromToken: "PON", toToken: "WAVE" });
          } else if (node.symbol === "KITE") {
            onSelectPair({ fromToken: "KITE", toToken: "PON" });
          }
          onSelectWallet(null);
        }
      }
      return;
    }

    // 2. If was panning canvas background:
    if (panStateRef.current.isDragging) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const dragDist = Math.hypot(
        mouseX - panStateRef.current.dragStartX,
        mouseY - panStateRef.current.dragStartY
      );
      panStateRef.current.isDragging = false;
      canvas.style.cursor = "default";

      // If clicked empty background without panning, reset selection
      if (dragDist < 4) {
        onSelectPair(null);
        onSelectWallet(null);
      }
    }
  };

  // Native non-passive Wheel listener to ensure canvas zoom strictly prevents landing page scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      // Prevent landing page from scrolling when mouse is over canvas
      e.preventDefault();
      e.stopPropagation();

      const factor = e.deltaY < 0 ? 1.18 : 0.85;
      zoomStateRef.current.target = THREE.MathUtils.clamp(
        zoomStateRef.current.target * factor,
        0.45,
        2.8
      );
    };

    // { passive: false } is mandatory so e.preventDefault() actually cancels document scrolling
    container.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

  // Smooth Animated Zoom Buttons
  const handleZoom = (direction: "in" | "out") => {
    const factor = direction === "in" ? 1.25 : 0.8;
    zoomStateRef.current.target = THREE.MathUtils.clamp(
      zoomStateRef.current.target * factor,
      0.45,
      2.8
    );
  };

  // Smooth Animated Reset View & Restore Pristine Layout
  const handleResetView = () => {
    zoomStateRef.current.target = 1.0;
    panStateRef.current.targetX = 0;
    panStateRef.current.targetY = 0;
    onSelectPair(null);
    onSelectWallet(null);

    // Reset all nodes back to their pristine neat initial coordinates
    const ref = threeRef.current;
    if (ref) {
      ref.simulationNodes.forEach((node) => {
        const orig = INITIAL_NEAT_POSITIONS[node.id];
        if (orig) {
          node.x = orig.x;
          node.y = orig.y;
          const mesh = ref.nodeMeshes.get(node.id);
          if (mesh) {
            mesh.position.x = orig.x;
            mesh.position.y = orig.y;
            mesh.position.z = 10;
          }
        }
      });
      updateLinkGeometries(ref.linkMeshes);
    }
  };

  const handleStepObservation = () => {
    const nextIdx = (currentObsIndex + 1) % DEMO_ROTATION_OBSERVATIONS.length;
    setCurrentObsIndex(nextIdx);
    activeObsRef.current.index = nextIdx;
    activeObsRef.current.progress = 0;
  };

  const activeObs = DEMO_ROTATION_OBSERVATIONS[currentObsIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[540px] bg-[#f8fafc] overflow-hidden select-none overscroll-contain"
    >
      {/* 1. Three.js Canvas Element */}
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="w-full h-full block cursor-grab touch-none"
      />

      {/* 2. Top-Left Live Network Observation Floating Pill */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 sm:top-4 sm:left-4 flex flex-col gap-2 z-10 font-mono">
        <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xl px-3 py-1 rounded-full border border-zinc-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-900 uppercase">
            NETWORK OBSERVATION
          </span>
          <span className="text-zinc-300">/</span>
          <span className="text-[10px] text-zinc-500 font-medium">
            SAMPLE REPLAY
          </span>
        </div>

        {/* Live Replay Active Observation Ticker */}
        <div className="flex items-center gap-2 text-xs text-zinc-700 bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-zinc-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] pointer-events-auto w-fit">
          <span className="text-zinc-400 text-[10px] font-semibold tracking-wider uppercase">Active:</span>
          <span className="text-amber-900 font-bold bg-amber-50/90 px-1.5 py-0.5 rounded text-[11px] border border-amber-200/70">
            {activeObs.walletId.replace("wallet-", "")}
          </span>
          <span className="text-zinc-400">→</span>
          <span className="text-rose-600 font-semibold bg-rose-50/80 px-1.5 py-0.5 rounded text-[11px] border border-rose-100">
            sold {activeObs.fromToken}
          </span>
          <span className="text-zinc-400">→</span>
          <span className="text-emerald-700 font-semibold bg-emerald-50/80 px-1.5 py-0.5 rounded text-[11px] border border-emerald-100">
            bought {activeObs.toToken}
          </span>
          <span className="text-zinc-500 text-[11px] font-medium bg-zinc-100/90 px-1.5 py-0.5 rounded border border-zinc-200/50">
            Δ {activeObs.deltaMinutes}m
          </span>
        </div>
      </div>

      {/* 3. Top-Right Minimal Glass Toolbar */}
      <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex items-center gap-1 z-10 font-mono bg-white/85 backdrop-blur-xl p-1 rounded-xl border border-zinc-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => handleZoom("in")}
          className="size-7 rounded-lg hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
          title="Smooth Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom("out")}
          className="size-7 rounded-lg hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
          title="Smooth Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="size-7 rounded-lg hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
          title="Rapikan Layout / Reset View"
          aria-label="Rapikan layout dan reset view"
        >
          <RotateCcw className="size-3.5" />
        </button>

        {!isProofOpen && (
          <button
            type="button"
            onClick={onToggleProof}
            className="h-7 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-0.5"
            title="Inspect Proof Evidence Panel"
          >
            <Info className="size-3 text-amber-600" />
            <span>Proof</span>
          </button>
        )}
      </div>

      {/* 4. Bottom-Left Floating Replay Dock with Live Scrubber Track */}
      <div className="absolute bottom-3.5 left-3.5 sm:bottom-4 sm:left-4 z-10 flex items-center gap-2.5 font-mono bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-zinc-200/90 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="size-7 rounded-lg bg-zinc-900 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          title={isPlaying ? "Pause Replay" : "Resume Replay"}
          aria-label={isPlaying ? "Pause replay" : "Resume replay"}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={handleStepObservation}
          className="size-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          title="Next Observation"
          aria-label="Next observation"
        >
          <StepForward className="size-3.5" />
        </button>

        {/* Live Replay Scrubber Track */}
        <div
          className="hidden xs:flex flex-col gap-0.5 border-l border-zinc-200/80 pl-2.5 pr-1"
          title="15-minute match window replay timeline"
        >
          <div className="flex items-center justify-between text-[9px] text-zinc-400 font-semibold uppercase">
            <span>Cycle</span>
            <span>15m</span>
          </div>
          <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
            <div
              ref={progressTrackRef}
              className="h-full bg-amber-500 rounded-full transition-all duration-75"
              style={{ width: "0%" }}
            />
          </div>
        </div>

        {/* Speed Segmented Controller */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-500 border-l border-zinc-200/80 pl-2">
          <span>Speed:</span>
          {([1, 10, 20] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setReplaySpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${replaySpeed === s
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/80"
                }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500 border-l border-zinc-200/80 pl-2">
          <span>Obs</span>
          <span className="text-zinc-900 font-bold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/50">
            {currentObsIndex + 1}/{DEMO_ROTATION_OBSERVATIONS.length}
          </span>
        </div>
      </div>

      {/* 5. Bottom-Right Quick Interaction Hint */}
      <div className="pointer-events-none hidden md:flex absolute bottom-4 right-4 z-10 items-center gap-1.5 font-mono text-[10px] text-zinc-500 bg-white/85 backdrop-blur-xl px-3 py-1 rounded-full border border-zinc-200/70 shadow-2xs select-none">
        <span className="size-1.5 rounded-full bg-zinc-400" />
        <span>Drag nodes freely · Scroll to zoom</span>
      </div>

      {/* 6. Tooltip on Hover */}
      {hoveredInfo && (
        <div
          className="pointer-events-none absolute z-30 bg-white/95 border border-zinc-200/90 rounded-xl p-3 shadow-xl text-xs font-mono text-zinc-800 backdrop-blur-xl max-w-[270px]"
          style={{
            left: `${hoveredInfo.x}px`,
            top: `${hoveredInfo.y}px`,
            transform: "translate(0, 0)",
          }}
        >
          <div className="font-bold text-zinc-950 flex items-center justify-between pb-1.5 border-b border-zinc-100 mb-2">
            <span>{hoveredInfo.title}</span>
          </div>
          <p className="text-[11px] text-zinc-600 mb-2">{hoveredInfo.subtitle}</p>
          <div className="space-y-1 text-[10px] text-zinc-700">
            {hoveredInfo.details.map((d, i) => (
              <div key={i} className="text-zinc-800 flex items-center gap-1">
                <span className="size-1 rounded-full bg-zinc-300" />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Active Focus Clear Button */}
      {(selectedPair || selectedWalletAddress) && (
        <div className="absolute top-16 left-3.5 sm:left-4 z-10 flex items-center gap-2 bg-amber-50/90 border border-amber-300/80 backdrop-blur-xl px-3 py-1.5 rounded-lg text-xs font-mono text-amber-900 shadow-xs">
          <span>
            Focused:{" "}
            {selectedPair
              ? `${selectedPair.fromToken} → ${selectedPair.toToken}`
              : selectedWalletAddress?.slice(0, 8) + "…"}
          </span>
          <button
            type="button"
            onClick={() => {
              onSelectPair(null);
              onSelectWallet(null);
            }}
            className="text-amber-800 hover:text-black font-semibold underline text-[11px] cursor-pointer ml-1"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
