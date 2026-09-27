import { describe, it, expect } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { multicall3Abi } from "viem";
import { HypersyncClient } from "@envio-dev/hypersync-client";
import { Hono } from "hono";
import { z } from "zod";
import * as THREE from "three";
import * as d3Force from "d3-force";
import { forceSimulation as forceSimulation3d } from "d3-force-3d";
import React from "react";
import { render } from "ink";
import { WakeTerminal } from "../packages/cli/src/index.js";

describe("Stack Installation & Verification Test", () => {
  it("verifies viem & Multicall3 contract ABI", () => {
    expect(multicall3Abi).toBeDefined();
    expect(multicall3Abi.length).toBeGreaterThan(0);
    const aggregate3 = multicall3Abi.find((item) => item.type === "function" && item.name === "aggregate3");
    expect(aggregate3).toBeDefined();
  });

  it("verifies @envio-dev/hypersync-client", () => {
    expect(HypersyncClient).toBeDefined();
  });

  it("verifies Hono, zod, and SSE support", async () => {
    const app = new Hono();
    const schema = z.object({ name: z.string() });
    
    app.post("/test", async (c) => {
      const body = await c.req.json();
      const parsed = schema.parse(body);
      return c.json({ hello: parsed.name });
    });

    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Wake" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hello).toBe("Wake");
  });

  it("verifies node:sqlite in-memory storage", () => {
    const db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE test_tokens (
        address TEXT PRIMARY KEY,
        symbol TEXT NOT NULL
      );
      INSERT INTO test_tokens (address, symbol) VALUES ('0x123', 'WAKE');
    `);

    const query = db.prepare("SELECT * FROM test_tokens WHERE address = ?");
    const row = query.get("0x123") as { address: string; symbol: string };
    expect(row).toBeDefined();
    expect(row.symbol).toBe("WAKE");
    db.close();
  });

  it("verifies Three.js and d3 force 2D/3D libraries", () => {
    // Three.js
    const scene = new THREE.Scene();
    expect(scene).toBeDefined();

    // d3-force (2D)
    const sim2d = d3Force.forceSimulation([]);
    expect(sim2d).toBeDefined();
    sim2d.stop();

    // d3-force-3d (3D)
    const sim3d = forceSimulation3d([]);
    expect(sim3d).toBeDefined();
    sim3d.stop();
  });

  it("verifies Ink terminal UI component", () => {
    const instance = render(React.createElement(WakeTerminal));
    expect(instance).toBeDefined();
    instance.unmount();
  });
});
