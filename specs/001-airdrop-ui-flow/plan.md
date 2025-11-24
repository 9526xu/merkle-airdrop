# Implementation Plan: Functional UI & Deployment Scripts

**Branch**: `001-airdrop-ui-flow`
**Date**: 2025-11-24
**Spec**: `/Users/xrj/Documents/github/merkle-airdrop/specs/001-airdrop-ui-flow/spec.md`

## Summary

Implement the frontend user interfaces for User Whitelist Registration and Airdrop Claiming, along with an Admin panel for phase management. This plan also covers the creation of robust deployment scripts using Foundry and OpenZeppelin AccessControl to manage the on-chain state. The frontend will be separated into a dedicated directory structure.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Solidity 0.8.20 (Contracts)
**Frontend Framework**: Next.js 14 (App Router) - *Proposed for rapid development and routing capabilities*
**Styling**: Tailwind CSS - *Proposed for minimal, clean UI*
**Web3 Integration**: RainbowKit + Wagmi + Viem - *Industry standard for wallet connection and contract interaction*
**Contract Tooling**: Foundry (Forge) for deployment scripts and testing
**Project Type**: Monorepo-style (adding `frontend/` folder to root)
**Target Platform**: Web Browsers (MetaMask/WalletConnect support)
**Performance Goals**: Instant UI feedback, <2s transaction prep time
**Constraints**: 
- **Minimal MVP UI**: Focus on functionality over custom aesthetics.
- **Strict Folder Separation**: Admin and User logic must be physically separated in the file system.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Stack**: Using Solidity 0.8.20 & Foundry (Principle 1).
- [x] **Docs**: Plan and artifacts in English (Principle 2 & 4).
- [x] **Structure**: Following standard Foundry layout; adding standard Next.js structure (Principle 3).

## Project Structure

### Documentation (this feature)

```text
specs/001-airdrop-ui-flow/
├── plan.md              # This file
├── research.md          # Phase 0: Tech stack confirmation
├── data-model.md        # Phase 1: Frontend state & Component tree
├── quickstart.md        # Phase 1: How to run frontend & deploy
└── contracts/           # Phase 1: Deployment script APIs
```

### Source Code (Proposed)

```text
# Root Directory
frontend/                # NEW: Dedicated frontend application
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── admin/       # RESTRICTED: Admin Dashboard routes
│   │   │   └── page.tsx
│   │   └── user/        # PUBLIC: User Whitelist/Claim routes (or root /)
│   │       └── page.tsx
│   ├── components/      # Shared UI components
│   └── lib/             # Wagmi config, contract ABIs
├── package.json
└── ...

script/                  # EXISTING: Foundry scripts
├── DeployMerkleAirdrop.s.sol # NEW: Deployment & Setup script
└── ...
```

## Phases

### Phase 0: Outline & Research

1. **Tech Stack Validation**:
   - Task: "Analyze Next.js + RainbowKit suitability for MVP vs plain Vite React" (Recommendation: Next.js for better routing of Admin/User separation).
   - Task: "Confirm OpenZeppelin AccessControl usage pattern for MerkleAirdrop".

2. **Consolidate findings** in `research.md`.

### Phase 1: Design & Contracts

1. **Frontend Architecture**:
   - Define `data-model.md`: Client-side state (Wallet status, Phase status, Proof generation).
   - Define Component/Page split for Admin vs User.

2. **Contract Scripts**:
   - Design `DeployMerkleAirdrop.s.sol`: 
     - Deploy Token (if needed) & Airdrop contract.
     - Setup Roles (Grant DEFAULT_ADMIN_ROLE to deployer).
     - Verify on Etherscan (optional but good practice).

3. **Agent context update**:
   - Run `.specify/scripts/bash/update-agent-context.sh gemini`.

### Phase 2: Implementation (Tasks)

*To be expanded by speckit.tasks*

- Initialize Next.js project in `frontend/`.
- Install dependencies (wagmi, viem, rainbowkit, tanstack-query).
- Implement `DeployMerkleAirdrop.s.sol`.
- Build "Connect Wallet" wrapper.
- Build **User Flow**: Whitelist Form -> Status Check -> Claim Button.
- Build **Admin Flow**: Phase Switcher -> Root Updater.
- Integrate Backend API (whitelist.json read/write).