# Tasks: Gasless Airdrop Claim

**Input**: Design documents from `/Users/xrj/Documents/github/merkle-airdrop/specs/001-airdrop-claim-gasless/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tasks for tests are included as they are fundamental to smart contract development.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup.

- [ ] T001 [P] Initialize a Node.js project in the `backend/` directory by running `npm init -y`.
- [ ] T002 [P] Create the directory structure `backend/src/api`, `backend/src/services`, `backend/src/utils`, and `backend/test`.
- [ ] T003 [P] Create the directory `scripts/`.
- [ ] T004 Install backend dependencies in the `backend/` directory: `npm install typescript ts-node express ethers@^5 merkletreejs keccak256`.
- [ ] T005 Install backend development dependencies: `npm install -D @types/node @types/express jest ts-jest`.
- [ ] T006 Configure TypeScript by creating a `backend/tsconfig.json` file.
- [ ] T007 Install smart contract dependencies: `forge install OpenZeppelin/openzeppelin-contracts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T008 Create the basic `MerkleAirdrop.sol` contract file in `src/MerkleAirdrop.sol` with initial state variables (`merkleRoot`, `token`).
- [ ] T009 Create a mock ERC20 token contract `src/mocks/MockToken.sol` for testing purposes.
- [ ] T010 Create the initial test file `test/MerkleAirdrop.t.sol` with basic setup (deploying contracts).
- [ ] T011 Implement the Merkle tree generation script `scripts/generate-merkle-tree.js` to process a `whitelist.json` file.
- [ ] T012 Create a basic HTTP server setup in `backend/src/index.ts`.

---

## Phase 3: User Story 1 - Successful Airdrop Claim (Priority: P1) 🎯 MVP

**Goal**: A whitelisted user can successfully claim their airdrop without paying gas.

**Independent Test**: A test using a valid Merkle proof for a whitelisted address should result in the user receiving tokens.

### Tests for User Story 1 ⚠️

- [ ] T013 [US1] In `test/MerkleAirdrop.t.sol`, write a test case `test_claim_success` that verifies a whitelisted user can claim successfully.

### Implementation for User Story 1

- [ ] T014 [US1] In `src/MerkleAirdrop.sol`, implement the `claim` function, including Merkle proof verification using OpenZeppelin's `MerkleProof.sol`.
- [ ] T015 [US1] In `backend/src/services/claimService.ts`, implement the logic to verify an EIP-712 signature.
- [ ] T016 [US1] In `backend/src/services/claimService.ts`, implement the logic to generate a Merkle proof for a user and call the smart contract.
- [ ] T017 [US1] In `backend/src/api/claim.ts`, create the `POST /claim` endpoint that uses the `claimService`.
- [ ] T018 [US1] In `backend/test/claim.test.ts`, write an integration test for a successful claim through the `/claim` endpoint.

---

## Phase 4: User Story 2 - Non-Whitelisted User (Priority: P2)

**Goal**: The system rejects claim attempts from users not on the whitelist.

**Independent Test**: A test using an invalid Merkle proof should be rejected by the contract and the backend.

### Tests for User Story 2 ⚠️

- [ ] T019 [P] [US2] In `test/MerkleAirdrop.t.sol`, write a test `test_claim_fails_for_non_whitelisted_user` that expects a revert.
- [ ] T020 [P] [US2] In `backend/test/claim.test.ts`, write an integration test for a non-whitelisted user, expecting a 400-level error.

### Implementation for User Story 2

- [ ] T021 [US2] Ensure the `claim` function in `src/MerkleAirdrop.sol` properly reverts for invalid proofs (already covered by T014, but verify).
- [ ] T022 [US2] In `backend/src/services/claimService.ts`, add a check to verify the user is in the whitelist before attempting to build and send a transaction.

---

## Phase 5: User Story 3 - Duplicate Claim Attempt (Priority: P3)

**Goal**: The system prevents a user from claiming an airdrop more than once.

**Independent Test**: A test where a user successfully claims, then attempts to claim again, should be rejected.

### Tests for User Story 3 ⚠️

- [ ] T023 [P] [US3] In `test/MerkleAirdrop.t.sol`, write a test `test_claim_fails_on_duplicate_claim` that expects a revert.
- [ ] T024 [P] [US3] In `backend/test/claim.test.ts`, write an integration test for a duplicate claim attempt, expecting a 400-level error.

### Implementation for User Story 3

- [ ] T025 [US3] In `src/MerkleAirdrop.sol`, add and use a `mapping(address => bool) public hasClaimed` to track and block duplicate claims.
- [ ] T026 [US3] In `backend/src/services/claimService.ts`, add a check to see if a user has already claimed before sending the transaction.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] T027 [P] Add comprehensive, user-friendly error handling to the `backend/src/api/claim.ts` endpoint.
- [ ] T028 [P] Implement structured logging in the backend service.
- [ ] T029 Implement secure management of the relayer private key in the backend (e.g., using environment variables and a `.env` file).
- [ ] T030 Write the project's final `README.md` file, explaining setup and usage for all components.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** and **Phase 2 (Foundational)** MUST be completed before any user story work begins.
- **User Stories (Phases 3, 4, 5)** can be worked on sequentially. Each depends on Phase 2 completion.
- Within each user story, tests should be written first to guide implementation.
- **Phase 6 (Polish)** can be addressed after the core user stories are complete.