# Tasks: Functional UI & Deployment Scripts

**Feature**: `001-airdrop-ui-flow`
**Inputs**: plan.md, spec.md, research.md, data-model.md, contracts/
**Tests**: Optional (not strictly requested, but good practice for robust backend)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create frontend directory and initialize Next.js project
- [x] T002 [P] Install frontend dependencies (wagmi, viem, rainbowkit, tanstack-query)
- [x] T003 [P] Configure Tailwind CSS in `frontend/tailwind.config.ts` and `frontend/src/app/globals.css`
- [x] T004 [P] Setup Wagmi and RainbowKit config in `frontend/src/lib/wagmi.ts`
- [x] T005 [P] Create shared UI components directory `frontend/src/components/`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T006 [CRITICAL] Refactor `src/MerkleAirdrop.sol`: Replace `Ownable` with `AccessControl`, make `merkleRoot` mutable, add `updateMerkleRoot`, and restrict `claim` to `RELAYER_ROLE`.
- [x] T007 Create API client for local JSON storage in `frontend/src/lib/api.ts`
- [x] T008 [P] Define TypeScript interfaces for Whitelist and UserState in `frontend/src/types/index.ts`
- [x] T009 Create `DeployMerkleAirdrop.s.sol` script in `script/` with Role Setup (Grant DEFAULT_ADMIN to deployer, set up other roles).
- [x] T010 Implement `ConnectWallet` component in `frontend/src/components/ConnectWallet.tsx`
- [ ] T011 [Backend] Create data directory `backend/data/` and initialize `backend/data/whitelist.json` with empty array.
- [ ] T012 [Backend] Install `cors` in `@backend` and configure `backend/src/index.ts` to allow requests from frontend (localhost:3000).

## Phase 3: User Story 1 - User Whitelist & Claim (Priority: P1)

**Goal**: Users can register for whitelist and claim tokens.
**Independent Test**: User connects wallet -> Registers -> Checks status -> Claims tokens (on local chain).

- [ ] T013 [Backend] [US1] Implement `POST /api/whitelist/join` endpoint in `backend/src/api/whitelist.ts` to write to `backend/data/whitelist.json`.
- [ ] T014 [Backend] [US1] Implement `GET /api/whitelist/status` endpoint in `backend/src/api/whitelist.ts` reading from `backend/data/whitelist.json`.
- [ ] T015 [Frontend] [US1] Create Whitelist Registration Form component in `frontend/src/components/WhitelistForm.tsx` using `frontend/src/lib/api.ts` (pointing to Express).
- [ ] T016 [Frontend] [US1] Create Airdrop Claim component in `frontend/src/components/ClaimAirdrop.tsx` using `frontend/src/lib/api.ts`.
- [ ] T017 [Frontend] [US1] Assemble User Page in `frontend/src/app/user/page.tsx` combining Form and Claim components.

## Phase 4: User Story 2 - Admin Management (Priority: P2)

**Goal**: Admin can manage phases and update merkle root.
**Independent Test**: Admin logs in -> Stops collection -> Generates Tree -> Updates Contract.

- [ ] T018 [Backend] [US2] Implement shared `MerkleGenerator` class in `backend/src/utils/merkle.ts`.
- [ ] T019 [Backend] [US2] Refactor `backend/scripts/generate-merkle-tree.js` to use `MerkleGenerator` and read from `backend/data/whitelist.json`.
- [ ] T020 [Backend] [US2] Implement `POST /api/admin/generate-tree` endpoint in `backend/src/api/admin.ts` that uses `MerkleGenerator`.
- [ ] T021 [Frontend] [US2] Implement Admin Login/Auth protection wrapper in `frontend/src/components/AdminAuth.tsx` (Simple password check).
- [ ] T022 [Frontend] [US2] Create Admin Dashboard controls (Stop Collection, Update Root) in `frontend/src/components/AdminControls.tsx` calling backend API.
- [ ] T023 [Frontend] [US2] Assemble Admin Page in `frontend/src/app/admin/page.tsx`.

## Phase 5: User Story 3 - Gasless Airdrop Claim (Priority: P1)

**Goal**: Eligible users claim tokens without paying gas. (Refines US1 Claim flow)

- [ ] T024 [Frontend] [US3] Update `ClaimAirdrop.tsx` to support EIP-712 signature generation and submitting to `backend/src/api/claim.ts` (Relayer).
- [ ] T025 [Backend] [US3] Verify `backend/src/api/claim.ts` correctly uses the new `merkle-tree.json` generated in US2 for validation.

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T026 [P] Add error handling toast notifications in Frontend.
- [ ] T027 Update `README.md` with instructions for running both Frontend and Backend.
- [ ] T028 Verify full flow against `quickstart.md` steps.

## Implementation Strategy

### MVP First (User Story 1)
1. Complete Phase 1 & 2 (Setup & Foundation).
2. Complete Phase 3 (User Story 1).
3. Verify User Registration works end-to-end (Frontend -> Express Backend -> JSON file).

### Incremental Delivery
1. Add Phase 4 (Admin) to allow closing registration and generating proofs.
2. Add Phase 5 (Gasless) to enable the Relayer flow.