# Wake Algorithm

This document defines the behavioral rules used by Wake to normalize
on-chain trades, detect wallet rotations, aggregate links, and calculate
inflow observations.

Wake is a TypeScript port of STAMPEDE. STAMPEDE behavior is treated as
the reference specification for parity.

Any intentional deviation from the reference behavior must be documented
in `docs/PARITY.md`.

---

## 1. Scope

Wake observes supported on-chain activity on Robinhood Chain.

The algorithm operates on normalized trade observations.

The core observation is:

> The same wallet appears to sell token A and subsequently buy token B
> within a configured time window.

Wake describes this observed sequence.

It does not infer:

- ownership
- shared control
- insider information
- intent
- causality
- guaranteed future price movement

---

# 2. Trade Normalization

A raw on-chain event must first be converted into a normalized `Trade`.

A normalized trade contains at least:

- `wallet`
- `token`
- `side`
- `quoteAmount`
- `tokenAmount`
- `price`
- `timestamp`
- `transactionHash`
- `blockNumber`
- `source`
- `confidence`

Supported trade sources:

### Curve

- `CurveBuy`
- `CurveSell`

These represent activity on the supported bonding curve.

### v4

- `Swap`

These represent activity on graduated v4 pools.

All supported trade sources must be converted into the same
normalized representation before rotation matching.

---

# 3. Trade Eligibility

A trade is eligible for rotation matching only when it contains
the information required by the rotation algorithm.

Trades below the configured dust threshold are ignored.

The dust threshold is configured in:

`config/rotation.ts`

Ignored trades do not participate in:

- rotation matching
- link aggregation
- inflow calculation

---

# 4. Actor Identification

Contract addresses are not treated as traders.

Router and aggregator contracts must not become wallet actors in
the rotation graph.

For graduated v4 pools, the transaction sender may be a router.

Therefore v4 wallet attribution may have:

```text
confidence = low