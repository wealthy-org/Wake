export type NodeType = "token" | "wallet";

export interface TokenNode {
  id: string;
  type: "token";
  symbol: string;
  name: string;
  dex: string;
  curveProgress?: number;
  inflowWallets: number;
  outflowWallets: number;
  // D3 force simulation properties
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  radius: number;
}

export interface WalletNode {
  id: string;
  type: "wallet";
  address: string;
  shortAddress: string;
  rotationsCount: number;
  primaryRotation?: {
    fromToken: string;
    toToken: string;
    deltaMinutes: number;
    amountSell: number;
    amountBuy: number;
  };
  // D3 force simulation properties
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  radius: number;
}

export type NetworkNode = TokenNode | WalletNode;

export interface NetworkLink {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  kind: "token_to_wallet" | "wallet_to_token" | "token_to_token";
  fromToken: string;
  toToken: string;
  walletCount: number;
  walletAddress?: string;
  deltaMinutes?: number;
  isUnclear?: boolean;
}

export interface ProofRow {
  id: string;
  walletAddress: string;
  fromToken: string;
  toToken: string;
  sellAmountUsd: number;
  sellTimeUtc: string;
  sellTxHash: string;
  sellBlock: number;
  sellDex: string;
  buyAmountUsd: number;
  buyTimeUtc: string;
  buyTxHash: string;
  buyBlock: number;
  buyDex: string;
  deltaMinutes: number;
  grade: "CLEAN" | "UNCLEAR";
  note?: string;
}

export interface RotationObservation {
  id: string;
  walletId: string;
  fromToken: string;
  toToken: string;
  deltaMinutes: number;
  timestamp: string;
  sellAmount: number;
  buyAmount: number;
}

export interface ReplayState {
  isPlaying: boolean;
  speed: 1 | 10 | 20;
  currentStepIndex: number;
  activeObservationId: string | null;
  phase: "idle" | "wallet_active" | "sell_pulse" | "wallet_highlight" | "buy_pulse" | "settled";
}
