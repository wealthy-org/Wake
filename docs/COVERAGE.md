# COVERAGE.md

This document defines what Wake observes, how that data is obtained,
what is not covered, and how data limitations are communicated.

Wake is an observation tool. Coverage describes the available data
surface and must not be interpreted as complete visibility into all
activity on Robinhood Chain.

---

## 1. Coverage Scope

Wake currently observes supported activity on Robinhood Chain from:

- Pons V2 bonding curves
- graduated v4 pools

The supported on-chain activity is used to identify:

- trades
- wallet rotations
- token inflow
- token outflow
- network links
- transaction evidence

Wake does not claim complete chain-wide coverage.

---

## 2. Supported Trade Sources

Wake currently normalizes the following trade types.

### Pons V2

Supported curve events:

- `CurveBuy`
- `CurveSell`

These represent trading activity on the supported bonding curves.

### Graduated v4 Pools

Supported pool activity:

- `Swap`

These represent swaps occurring in supported graduated v4 pools.

All supported trade sources are normalized before being consumed by
the rotation engine.

---

## 3. Normalized Trade Data

A supported trade is normalized into a common representation containing,
where available:

- wallet/address
- token
- side
- token quantity
- quote amount
- price
- timestamp
- block number
- transaction hash
- source
- wallet confidence

The normalized representation allows Curve and v4 observations to
participate in the same downstream rotation logic.

---

## 4. Wallet Attribution

Wallet attribution depends on the source of the transaction.

Contract addresses such as:

- routers
- aggregators

are not treated as traders.

For graduated v4 pools, the transaction `sender` may be a router.

Therefore wallet attribution for v4 observations may have:

```text
confidence: low