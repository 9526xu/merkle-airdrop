# Tasks: Functional UI & Deployment Scripts

**Input**: Design documents from `/specs/001-airdrop-ui-flow/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Tests**: Tests are OPTIONAL and not explicitly requested in spec.md, so they are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Contracts**: `src/` & `script/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create frontend directory and initialize Next.js project
- [x] T002 [P] Install frontend dependencies (wagmi, viem, rainbowkit, tanstack-query)
- [x] T003 [P] Configure Tailwind CSS in `frontend/tailwind.config.ts` and `frontend/src/app/globals.css`
- [x] T004 [P] Setup Wagmi and RainbowKit config in `frontend/src/lib/wagmi.ts`
- [x] T005 [P] Create shared UI components directory `frontend/src/components/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [CRITICAL] Refactor `src/MerkleAirdrop.sol`: Replace `Ownable` with `AccessControl`, make `merkleRoot` mutable, add `updateMerkleRoot`, and restrict `claim` to `RELAYER_ROLE`.
- [x] T007 Create API client for local JSON storage in `frontend/src/lib/api.ts`
- [x] T008 [P] Define TypeScript interfaces for Whitelist and UserState in `frontend/src/types/index.ts`
- [x] T009 Create `DeployMerkleAirdrop.s.sol` script in `script/` with Role Setup (Grant DEFAULT_ADMIN to deployer, set up other roles).
- [x] T010 Implement `ConnectWallet` component in `frontend/src/components/ConnectWallet.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Whitelist & Claim (Priority: P1) 🎯 MVP

**Goal**: Users can register for whitelist and claim tokens.

**Independent Test**: User connects wallet -> Registers -> Checks status -> Claims tokens (on local chain).

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement Whitelist Registration API route in `frontend/src/app/api/whitelist/join/route.ts`
- [ ] T012 [P] [US1] Implement Whitelist Status API route in `frontend/src/app/api/whitelist/status/route.ts`
- [ ] T013 [US1] Create Whitelist Registration Form component in `frontend/src/components/WhitelistForm.tsx`
- [ ] T014 [US1] Create Airdrop Claim component in `frontend/src/components/ClaimAirdrop.tsx`
- [ ] T015 [US1] Assemble User Page in `frontend/src/app/user/page.tsx` combining Form and Claim components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Admin Management (Priority: P1)

**Goal**: Admin can manage phases and update merkle root.

**Independent Test**: Admin logs in -> Stops collection -> Generates Tree -> Updates Contract.

### Implementation for User Story 2

- [ ] T016 [P] [US2] Implement Phase Management logic in `frontend/src/hooks/usePhase.ts` (Manage "Collection" vs "Claim" state via API/JSON, not on-chain)
- [ ] T017 [P] [US2] Implement Merkle Tree generation utility (using merkletreejs) in `frontend/src/lib/merkle.ts`
- [ ] T018 [P] [US1] Define EIP-712 'Claim' type constants in `frontend/src/lib/types.ts` (Must match contract's TypeHash definition)
- [ ] T019 [US2] Create Admin Login/Auth protection wrapper in `frontend/src/components/AdminAuth.tsx`
- [ ] T020 [US2] Create Admin Dashboard controls (Stop Collection, Update Root) in `frontend/src/components/AdminControls.tsx`
- [ ] T021 [US2] Assemble Admin Page in `frontend/src/app/admin/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T021 [P] Add error handling toast notifications
- [ ] T022 Update `README.md` with frontend running instructions
- [ ] T023 Verify full flow against `quickstart.md` steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1 implementation

### Within Each User Story

- Components before Pages
- API routes before UI integration
- Core logic before wrappers

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1 and US2 can start in parallel
- API routes and UI components can be built in parallel within US1

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (can register and claim mock)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories
