# RADAR.md

## 1. Purpose

Radar is the Inflow ranking system of Wake.

It ranks tokens according to observed wallet rotations entering
those tokens within the current session.

Radar operates on indexed session data and must respect the shared
session clock.

Radar describes observed activity only. It does not establish:

- ownership
- intent
- causality
- insider information
- guaranteed future price movement

---

## 2. Input

Radar consumes data produced by the core observation pipeline.

Relevant inputs include:

- clean/direct rotations
- token identity
- token age
- curve state
- curve progress
- historical wallet scores
- optional X mentions
- optional launch-intelligence data
- bot classification where available

Unclear rotations are excluded from the primary Radar calculation.

The rotation and pairing rules are defined in:

`docs/ALGORITHM.md`

Session timing is defined in:

`docs/ENGINE.md`

---

## 3. Inflow Definition

For a destination token `B`, an observed inflow exists when a wallet
performs a valid rotation:

```text
A → B