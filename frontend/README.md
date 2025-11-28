## Merkle Airdrop Frontend

### Getting Started

```bash
npm run dev
npm run build
npm run start
```

Open `http://localhost:3000` in the browser.

### Environment

- `NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS`: Airdrop contract address (e.g. Anvil or testnet)

Build notes:

- Next.js SSR stubs `@react-native-async-storage/async-storage` via webpack alias in `next.config.ts`.
- Non-browser externals (e.g. `pino-pretty`, `lokijs`) are excluded to prevent SSR build errors.

### Workflow Overview

1. Collection: users register to whitelist.
2. Processing: admin freezes whitelist and generates Merkle tree, then updates on-chain root.
3. Claim: users claim tokens using off-chain signature and Merkle proof.

### Backend Configuration

- `MERKLE_OUTPUT_DIR`: directory for `whitelist.json` and `merkle-tree.json` (default: `backend/data`).

### Testing

- Backend tests can be run from `backend/` with `npm test`.
- Includes unit test verifying whitelist status returns Merkle proof when available.
