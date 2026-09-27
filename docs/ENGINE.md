# Wake Engine

This document defines how Wake loads, processes, advances, and exposes
session data across Sample, Replay, and Live modes.

The engine is responsible for session execution and state coordination.

It is not the specification for trade pairing or rotation detection.
Rotation behavior is defined in `docs/ALGORITHM.md`.

---

## 1. Purpose

The Wake engine provides a shared execution layer for:

- Sample mode
- Replay mode
- Live mode

It coordinates:

- data feeds
- session time
- playback
- application state
- event propagation
- data ingestion
- backfill
- live updates

All application views must consume the same engine session state.

This prevents different parts of the application from displaying
different points in time.

---

# 2. Engine Architecture

The engine consists of five primary responsibilities:

```text
engine/
├── bus
├── feed
├── runner
├── state
└── seed