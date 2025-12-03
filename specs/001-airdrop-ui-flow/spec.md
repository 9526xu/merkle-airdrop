# Feature Specification: Frontend UI for Airdrop Collection & Claim

**Feature Branch**: `001-airdrop-ui-flow`
**Created**: 2025-11-24
**Status**: Draft
**Input**: User description: "需要前端用户操作界面,满足以下场景: - 白名单用户收集页面 - 空投领取页面 核心功能: - 用户在白名单页面点击,后台系统随机分配空投金额 - 用户在空投页面点击领取,拉起钱包进行签名,后台系统代付 gas,链上合约发放空投 这里我们讨论一下白名单用户开源项目都是如何收集的?我们这个项目是一个简单空投发放项目,如何做白名单用户前置收集? 先讨论清楚需求之后,再生成相关文档"

## Clarifications

### Session 2025-11-24
- Q: Should user registration and claiming happen simultaneously or in phases? → A: **Phased (Collection → Claiming)**. The system will support distinct phases controlled by an admin: a Collection Phase for registration and a Claim Phase for distribution after the Merkle Root is updated.
- Q: How should the Admin panel be secured? → A: **Basic Password**. A simple environment variable based password check is sufficient for this MVP scope.
- Q: Where should whitelist data be stored? → A: **Local JSON File**. Data will be persisted directly to a local JSON file on the server, avoiding complex database dependencies.
- Q: How is the Merkle Root updated on-chain? → A: **Admin Wallet Trigger**. The Admin UI will prompt the connected admin wallet to sign and send the update transaction; the backend does not hold the deployer key.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Whitelist Registration (Priority: P1)

Users visit the whitelist collection page to register their interest and receive a random airdrop allocation.

**Why this priority**: This is the entry point for the airdrop campaign; without users, there is no distribution.

**Independent Test**: Can be tested by a user connecting their wallet and successfully registering, seeing their allocated amount.

**Acceptance Scenarios**:

1. **Given** the system is in "Collection Phase", **When** a visitor connects their wallet, **Then** the system displays their wallet address and a "Join Whitelist" button.
2. **Given** a connected user, **When** they click "Join Whitelist", **Then** the system verifies the wallet address (no social auth required), allocates a random amount, and displays "You have been whitelisted for X tokens".
3. **Given** a user who has already registered, **When** they visit the page, **Then** the system displays their previously allocated amount.
4. **Given** the system is NOT in "Collection Phase", **When** a user visits the page, **Then** the registration buttons are disabled or hidden, and a status message is shown.

### User Story 2 - Admin Phase Management (Priority: P2)

An admin user can stop the collection phase, generate the merkle tree, and update the contract to start the claim phase.

**Why this priority**: Critical operational requirement to transition from collecting users to allowing them to claim (Phased approach).

**Independent Test**: Admin logs in/accesses admin route, clicks "Stop Collection", "Generate Tree", and "Update Contract".

**Acceptance Scenarios**:

1. **Given** an admin on the admin panel, **When** they enter the correct password, **Then** they gain access to the dashboard.
2. **Given** an authenticated admin, **When** they click "Stop Collection", **Then** the system rejects new whitelist registrations.
3. **Given** collection is stopped, **When** the admin clicks "Generate Merkle Tree", **Then** the system computes the root from all registered users.
4. **Given** a new merkle root, **When** the admin clicks "Update Contract", **Then** their connected wallet (MetaMask) prompts to sign the transaction.

### User Story 3 - Gasless Airdrop Claim (Priority: P1)

Eligible users visit the claim page to withdraw their tokens without paying gas fees.

**Why this priority**: Enables the core value transfer to the user.

**Independent Test**: Can be tested by an eligible user connecting, signing a message, and receiving tokens on-chain without spending ETH.

**Acceptance Scenarios**:

1. **Given** the system is in "Claim Phase", **When** an eligible user connects, **Then** the system displays their claimable amount and a "Claim" button.
2. **Given** an ineligible user, **When** they connect, **Then** the system displays "Not eligible".
3. **Given** an eligible user, **When** they click "Claim", **Then** the wallet requests a signature (EIP-712).
4. **Given** a signed message, **When** submitted, **Then** the system pays the gas, executes the transaction, and updates the UI to "Claimed".

### Edge Cases

- What happens when the backend gas wallet is empty? (System should show error/maintenance).
- What happens if the user rejects the signature? (UI stays in "Ready to claim" state).
- What happens if the user tries to claim twice? (Contract rejects, UI shows "Already claimed").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a web interface for whitelist registration.
- **FR-002**: The system MUST validate users solely by their unique wallet address connection.
- **FR-003**: The system MUST randomly generate an airdrop amount for each new registered user and persist it to a local JSON file.
- **FR-004**: The system MUST provide a web interface for claiming the airdrop.
- **FR-005**: The system MUST support wallet connection (e.g., MetaMask).
- **FR-006**: The system MUST construct a typed data signature (EIP-712) for the user to sign during the claim process.
- **FR-007**: The system MUST accept the user's signature and submit the transaction to the blockchain, paying for gas (Meta-transaction/Relayer).
- **FR-008**: The system MUST handle transaction failures and provide user feedback.
- **FR-009**: The system MUST provide an Admin interface secured by a shared password (env var) to switch phases.
- **FR-010**: The system MUST allow the Admin to trigger Merkle Tree generation and use their connected wallet to update the on-chain Root.

### Key Entities *(include if feature involves data)*

- **User**: Represents a participant (Wallet Address, Allocation Amount, Claim Status).
- **Airdrop Allocation**: The specific amount assigned to a User.
- **System State**: Current Phase (Collection / Closed / Claiming).
- **Storage**: Local JSON file (backend/whitelist.json).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete whitelist registration in under 1 minute.
- **SC-002**: Eligible users can claim tokens with 0 ETH balance in their wallet.
- **SC-003**: System handles 100 concurrent claim requests without backend failure.