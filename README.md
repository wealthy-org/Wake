# Wake

See where capital moves on Robinhood Chain.

Wake is a local-first on-chain observation tool for Robinhood Chain.
It runs on your own computer and lets you observe wallet rotations,
token flows, network activity, and related on-chain evidence.

## Features

- Inflow
- Coin Flow
- Network visualization
- Wallet Watchlist
- Rotation detection
- Alerts
- Track Record
- On-chain evidence
- Sample, Replay, and Live modes
- 2D and 3D network views

## How It Works

Wake observes public on-chain activity and presents the observed
sequence of transactions.

Wake does not claim ownership, intent, causality, or private
information that cannot be established from the available data.

## Requirements

- Node.js 22+
- npm

Optional:

- Hypersync token
- X/Twitter API credentials

Wake can run on public RPC without external API keys.

## Installation

```bash
git clone https://github.com/wealthy-org/Wake.git
cd wake
npm install

## Attribution

Wake is a TypeScript port of STAMPEDE
(https://github.com/Argona7/stampede), used with permission
from its original author.

See `docs/PERMISSION.md` for permission and attribution details.