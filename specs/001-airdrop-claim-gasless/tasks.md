# Tasks: Gasless Airdrop Claim (On-Chain Signature Verification)

**Input**: Design documents from `/Users/xrj/Documents/github/merkle-airdrop/specs/001-airdrop-claim-gasless/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tasks for tests are included as they are fundamental to smart contract development.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup.

- [ ] T001 [P] Initialize a Node.js project in the `backend/` directory by running `npm init -y`.
- [ ] T002 [P] Create the directory structure `backend/src/api`, `backend/src/services`, `backend/src/utils`, and `backend/test`.
- [ ] T003 [P] Create the directory `scripts/`.
- [ ] T004 Install backend dependencies in the `backend/` directory: `npm install typescript ts-node express ethers@^5 merkletreejs keccak256`.
- [ ] T005 Install backend development dependencies: `npm install -D @types/node @types/express jest ts-jest`.
- [ ] T006 Configure TypeScript by creating a `backend/tsconfig.json` file.
- [x] T007 Install smart contract dependencies: `forge install OpenZeppelin/openzeppelin-contracts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [x] T008 Create the directory `src/tokens/` and the basic MerkleAirdrop.sol contract file in `src/MerkleAirdrop.sol` inheriting from `Ownable` and `EIP712`.
- [x] T009 Create a deployable ERC20 token contract `src/tokens/AirdropToken.sol` for the airdrop.
- [x] T010 Create the initial test file `test/MerkleAirdrop.t.sol` with basic setup for deploying contracts and hashing the EIP712 struct.
- [ ] T011 Implement the Merkle tree generation script `scripts/generate-merkle-tree.js` to process a `whitelist.json` file.
- [ ] T012 Create a basic HTTP server setup in `backend/src/index.ts`.

---

## Phase 3: User Story 1 - Successful Airdrop Claim (Priority: P1) 🎯 MVP

**Goal**: A whitelisted user can successfully claim their airdrop without paying gas.

**Independent Test**: A test using a valid EIP-712 signature and Merkle proof for a whitelisted address should result in the user receiving tokens.

### Tests for User Story 1 ⚠️

- [x] T013 [US1] In `test/MerkleAirdrop.t.sol`, write a test case `test_claim_success` that simulates a user signing the EIP-712 hash and verifies a successful claim.

### Implementation for User Story 1

- [x] T014 [US1] In `src/MerkleAirdrop.sol`, implement the `claim` function, including EIP-712 signature verification (using `ecrecover`) and Merkle proof validation.
- [ ] T015 [US1] In `backend/src/services/claimService.ts`, implement the logic to relay the user's request (address, amount, proof, signature) to the smart contract.
- [ ] T016 [US1] In `backend/src/api/claim.ts`, create the `POST /claim` endpoint that accepts all necessary data from the user to pass to the service.
- [ ] T017 [US1] In `backend/test/claim.test.ts`, write an integration test for a successful claim, passing the full payload to the `/claim` endpoint.

---

## Phase 4: User Story 2 - Non-Whitelisted User (Priority: P2)

**Goal**: The system rejects claim attempts from users not on the whitelist.

**Independent Test**: A test using an invalid Merkle proof (but a valid signature) should be reverted by the contract.

### Tests for User Story 2 ⚠️

- [ ] T018 [P] [US2] In `test/MerkleAirdrop.t.sol`, write a test `test_claim_fails_for_non_whitelisted_user` that expects a revert due to invalid Merkle proof.

### Implementation for User Story 2

- [ ] T019 [US2] Ensure the `claim` function in `src/MerkleAirdrop.sol` properly reverts for invalid Merkle proofs (verify T014 implementation).
- [ ] T020 [US2] In `backend/src/services/claimService.ts`, add a preliminary check to see if a user is in the whitelist to avoid sending unnecessary transactions.

---

## Phase 5: User Story 3 - Duplicate Claim Attempt (Priority: P3)

**Goal**: The system prevents a user from claiming an airdrop more than once.

**Independent Test**: A test where a user successfully claims, then attempts to claim again with the same signature, should be rejected.

### Tests for User Story 3 ⚠️

- [ ] T021 [P] [US3] In `test/MerkleAirdrop.t.sol`, write a test `test_claim_fails_on_duplicate_claim` that expects a revert.

### Implementation for User Story 3

- [ ] T022 [US3] In `src/MerkleAirdrop.sol`, add and use a `mapping(address => bool) public hasClaimed` to track and block duplicate claims.
- [ ] T023 [US3] In `backend/src/services/claimService.ts`, add a preliminary check to see if a user has already claimed to avoid sending unnecessary transactions.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T024 [P] Add comprehensive, user-friendly error handling to the `backend/src/api/claim.ts` endpoint.
- [ ] T025 [P] Implement structured logging in the backend service.
- [ ] T026 Implement secure management of the relayer private key in the backend (e.g., using environment variables and a `.env` file).
- [ ] T027 Write the project's final `README.md` file, explaining setup and usage.