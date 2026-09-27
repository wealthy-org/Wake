# Wake Research

This document defines the research toolkit used by Wake for
historical data preparation, token intelligence, wallet scoring,
edge modeling, and walk-forward evaluation.

Research operates on stored and observable data.

Research outputs are derived measurements and historical analysis.
They must not be presented as guaranteed predictions or as proof
of intent or causality.

---

## 1. Research Scope

The Wake research toolkit provides the following CLI workflows:

- `wake backfill`
- `wake launch-intel`
- `wake wallet-scores`
- `wake edge`
- `wake backtest`

The research modules are located under:

```text
research/
├── backfill
├── backtest
├── edge
├── features
└── traders