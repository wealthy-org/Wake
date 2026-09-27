import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

export function createApiApp() {
  const app = new Hono();

  app.get("/api/status", (c) => {
    return c.json({
      status: "ok",
      mode: "sample",
      sessionClock: Date.now(),
    });
  });

  app.get("/api/stream", (c) => {
    return streamSSE(c, async (stream) => {
      await stream.writeSSE({
        data: JSON.stringify({ type: "connected", time: Date.now() }),
        event: "message",
      });
    });
  });

  return app;
}
