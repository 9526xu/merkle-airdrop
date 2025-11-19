# Implementation Plan: Gasless Airdrop Claim

**Branch**: `001-airdrop-claim-gasless` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/xrj/Documents/github/merkle-airdrop/specs/001-airdrop-claim-gasless/spec.md`

## Summary

This plan outlines the technical implementation for a gasless airdrop claim feature. Whitelisted users will sign an EIP-712 message to authorize a claim, which a backend relayer will process and submit to an on-chain contract, paying the gas fees on the user's behalf. The implementation will use Solidity with the Foundry framework for the on-chain components and a Node.js backend for the off-chain relayer. A helper script for Merkle tree generation will also be provided.

## Technical Context

**On-Chain (Smart Contracts)**
*   **Language/Version**: Solidity 0.8.20
*   **Framework**: Foundry
*   **Primary Dependencies**: OpenZeppelin Contracts
*   **Key Contracts**: `MerkleAirdrop.sol`, `IERC20.sol`

**Off-Chain (Backend & Tooling)**
*   **Backend Relayer**: Node.js/TypeScript with Ethers.js, Express/Fastify
*   **Merkle Tree Script**: JavaScript/TypeScript with `merkletreejs`
*   **Testing**: Foundry (on-chain), Jest/Vitest (off-chain)

**Frontend**
*   **To be determined via research**. Popular options include React/Next.js with Wagmi/Viem.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **Principle 1: Technology Stack**: **PASS**. The plan adheres to Solidity 0.8.20 and the Foundry framework.
*   **Principle 2: Code and Documentation Standards**: **PASS**. All generated artifacts will be in English.
*   **Principle 3: Project Structure and Architecture**: **PASS**. The proposed structure follows Foundry conventions and separates concerns.
*   **Principle 4: Communication Language**: **PASS**. This interaction is in Chinese, while technical artifacts are in English.

## Phase 0: Outline & Research

This phase focuses on resolving unknowns before design and implementation. The findings will be documented in `research.md`.

*   **Research Tasks**:
    1.  **OpenZeppelin Version**: Determine the latest stable version of OpenZeppelin Contracts and the recommended method for integration with Foundry (`forge install`).
    2.  **Backend Relayer Stack**: Research and document best practices for building a secure gas-relayer using Node.js. This includes nonce management, transaction error handling, and private key security.
    3.  **Frontend Stack**: Research and recommend a modern, open-source frontend stack for DApp development. The output should compare 2-3 popular choices (e.g., Next.js + Wagmi, Vite + Viem) and justify a recommendation.
    4.  **EIP-712 Structure**: Define and document the precise JSON structure for the EIP-712 typed data that users will sign. This is critical for frontend-backend-contract interoperability.
    5.  **Merkle Tree Generation**: Validate the `merkletreejs` library and create a proof-of-concept script that takes a JSON list of users/amounts and outputs a Merkle root and proofs for each user.

## Phase 1: Design & Contracts

Based on the research, this phase will produce the core design artifacts.

*   **`data-model.md`**: Document the on-chain and off-chain data structures.
    *   **On-Chain**: `MerkleAirdrop.sol` state variables (merkleRoot, token, hasClaimed mapping).
    *   **Off-Chain**: The structure of the whitelist JSON file (e.g., `[{ "address": "0x...", "amount": "1000000000000000000" }]`).
*   **API Contracts (`/contracts/`)**: An OpenAPI specification for the backend relayer.
    *   **Endpoint**: `POST /claim`
    *   **Request Body**: `{ "userAddress": "string", "signature": "string" }`
    *   **Success Response**: `{ "transactionHash": "string" }`
    *   **Error Responses**: Error codes for invalid signature, not whitelisted, already claimed, etc.
*   **`quickstart.md`**: A guide for developers on setting up the repository, installing dependencies (Foundry, Node.js), and running tests.
*   **Agent Context Update**: Run `.specify/scripts/bash/update-agent-context.sh gemini` to inform the agent of the selected technologies.

## Project Structure

### Documentation (this feature)

```text
specs/001-airdrop-claim-gasless/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (OpenAPI spec)
```

### Source Code (repository root)

```text
# Using a monorepo structure to separate concerns
src/                 # Solidity smart contracts
├── MerkleAirdrop.sol
test/
├── MerkleAirdrop.t.sol
script/
└── MerkleAirdrop.s.sol

backend/
├── src/
│   ├── api/             # Express/Fastify endpoint handlers
│   ├── services/        # Business logic (signature validation, tx submission)
│   └── utils/
└── test/

scripts/
└── generate-merkle-tree.js # Merkle tree generation helper script

# Frontend will be in a separate 'frontend/' directory once decided
```

**Structure Decision**: A monorepo-like structure is chosen to clearly separate the on-chain (`contracts`), off-chain (`backend`), and tooling (`scripts`) components. This aligns with the "high cohesion, low coupling" principle from the constitution.

## Complexity Tracking
No violations to justify.