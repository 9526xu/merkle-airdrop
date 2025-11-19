# Implementation Plan: Gasless Airdrop Claim (On-Chain Signature Verification)

**Branch**: `001-airdrop-claim-gasless` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/xrj/Documents/github/merkle-airdrop/specs/001-airdrop-claim-gasless/spec.md`

## Summary

This plan outlines the technical implementation for a gasless airdrop claim feature where the **on-chain contract is responsible for verifying the user's EIP-712 signature**. A backend relayer will simply forward the user's request (including the signature) to the smart contract and pay the associated gas fees. The implementation will use Solidity with the Foundry framework for the on-chain components and a Node.js backend for the off-chain relayer.

## Technical Context

**On-Chain (Smart Contracts)**
*   **Language/Version**: Solidity 0.8.20
*   **Framework**: Foundry
*   **Primary Dependencies**: OpenZeppelin Contracts
*   **Key Contracts**: 
    *   `MerkleAirdrop.sol`: Will contain logic for Merkle proof validation and EIP-712 signature verification.
    *   `AirdropToken.sol`: The ERC-20 token for the airdrop.

**Off-Chain (Backend & Tooling)**
*   **Backend Relayer**: Node.js/TypeScript with Ethers.js, Express/Fastify. Its primary role is to relay valid requests to the blockchain, not to verify signatures.
*   **Merkle Tree Script**: JavaScript/TypeScript with `merkletreejs`.
*   **Testing**: Foundry (on-chain), Jest/Vitest (off-chain).

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
    2.  **Backend Relayer Stack**: Research best practices for a secure, non-validating gas-relayer using Node.js. Focus on nonce management, error handling, and security.
    3.  **Frontend Stack**: Research and recommend a modern, open-source frontend stack for DApp development.
    4.  **EIP-712 On-Chain Verification**: Define and document the precise JSON structure for the EIP-712 typed data (which does NOT include the Merkle proof) and the corresponding Solidity struct and hashing mechanism required for on-chain verification.
    5.  **Merkle Tree Generation**: Validate the `merkletreejs` library and create a proof-of-concept script.

## Phase 1: Design & Contracts

Based on the research, this phase will produce the core design artifacts.

*   **`data-model.md`**: Document on-chain and off-chain data structures. (No significant change from previous plan).
*   **API Contracts (`/contracts/`)**: An OpenAPI specification for the backend relayer.
    *   **Endpoint**: `POST /claim`
    *   **Request Body**: `{ "userAddress": "string", "amount": "string", "signature": "string", "merkleProof": ["string"] }`
    *   **Success Response**: `{ "transactionHash": "string" }`
    *   **Error Responses**: Simplified error responses, as most validation is now on-chain.
*   **`quickstart.md`**: A guide for developers on setting up and running the project.

## Project Structure

(No changes from the previously corrected structure)

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
src/
├── tokens/
│   └── AirdropToken.sol
└── MerkleAirdrop.sol
test/
└── MerkleAirdrop.t.sol
script/
└── MerkleAirdrop.s.sol
backend/
└── ...
scripts/
└── generate-merkle-tree.js
```

**Structure Decision**: A monorepo-like structure is chosen to clearly separate the on-chain, off-chain, and tooling components, adhering to Foundry conventions.

## Complexity Tracking
No violations to justify.