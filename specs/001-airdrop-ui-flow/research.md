# Research & Technical Decisions

**Feature**: `001-airdrop-ui-flow`
**Date**: 2025-11-24

## 1. Frontend Technology Stack

### Decision
Use **Next.js (App Router)** with **RainbowKit**, **Wagmi**, and **Tailwind CSS**.

### Rationale
- **Requirement Alignment**: The user specifically requested a strict separation between Admin and User interfaces (`pages/admin` vs `pages/user`). Next.js App Router (`app/admin/page.tsx`, `app/user/page.tsx`) maps 1:1 to this requirement, enforcing isolation by default.
- **MVP Speed**: RainbowKit provides a production-ready "Connect Wallet" component handling generic connectors, network switching, and error states instantly. This saves hours of UI work compared to building a custom connector.
- **Modern Standards**: Wagmi (powered by Viem) is the current standard for type-safe Ethereum hooks in React. It handles request caching and loading states automatically.
- **Styling**: Tailwind CSS allows styling directly in markup, reducing the need for separate CSS files and speeding up the "minimal UI" development.

### Alternatives Considered
- **Vite + React + React Router**:
  - *Pros*: Lighter weight.
  - *Cons*: Requires manual routing configuration. Less "batteries-included" for API routes if we need a lightweight backend proxy later.
- **Ethers.js + Custom UI**:
  - *Pros*: Maximum control.
  - *Cons*: High development effort for wallet connection handling (chain switching, disconnecting, ENS resolution).

## 2. Smart Contract Access Control

### Decision
Use **OpenZeppelin `AccessControl`** for Role-Based Access Control (RBAC).

### Rationale
- **Granularity**: We need to distinguish between the "Super Admin" (who can upgrade or pause) and the "Operational Admin" (who updates the Merkle Root).
- **Standardization**: `AccessControl` is the industry standard, ensuring security and readability.

### Implementation Pattern
- Define `bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");`
- The deployment script will:
  1. Deploy `MerkleAirdrop`.
  2. Grant `DEFAULT_ADMIN_ROLE` to the deployer (cold wallet/multisig).
  3. Grant `UPDATER_ROLE` to the specific wallet used by the Admin UI (hot wallet).
- The `updateMerkleRoot` function will be modified (if not already) to use `onlyRole(UPDATER_ROLE)`.

## 3. Merkle Tree Generation Strategy

### Decision
Generate Merkle Trees client-side (in Admin UI) using `merkletreejs` and `keccak256`, matching the backend/Solidity logic.

### Rationale
- **Decentralization/Transparency**: The Admin explicitly sees the root being generated from the raw list before signing.
- **Simplicity**: Reuses the same JavaScript logic used in the existing `backend/scripts/generate-merkle-tree.js`.
