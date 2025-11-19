# Feature Specification: Gasless Airdrop Claim

**Feature Branch**: `001-airdrop-claim-gasless`
**Created**: 2025-11-19
**Status**: Draft
**Input**: User description: "这是一个给用户发送空投的项目 主要场景: 1.用户进行 EIP-712 信息签名,生成签名信息 2.后台系统收到用户签名信息,进行空投发放,为用户代付 gas 3.链上合约需要校验用户信息是白名单用户,进行空投发放 核心功能: - 空投领取 - 白名单用户验证"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Successful Airdrop Claim (Priority: P1)

A whitelisted user visits the claim interface, signs a message with their wallet, and receives their specified airdrop tokens without paying any gas fees. The system confirms the transaction and updates their claim status.

**Why this priority**: This is the primary success path and delivers the core value of the feature. The entire purpose of the project is to allow eligible users to receive their airdrop.

**Independent Test**: This can be fully tested by a single whitelisted user. The test passes if the user starts with no airdrop tokens, performs the claim action, and ends up with the correct amount of tokens in their wallet, having spent no gas.

**Acceptance Scenarios**:

1.  **Given** a user is on the whitelist and has not claimed the airdrop,
    **When** they sign the EIP-712 message for the claim and it's sent to the backend,
    **Then** the backend successfully dispatches a transaction and the user receives the airdrop tokens.
2.  **Given** the backend processes a valid claim,
    **When** the transaction is mined,
    **Then** the on-chain contract records the user's address to prevent future claims.

---

### User Story 2 - Non-Whitelisted User Claim Attempt (Priority: P2)

A user who is not on the whitelist attempts to claim the airdrop. The system rejects the attempt and provides a clear message indicating they are not eligible.

**Why this priority**: This is a critical security and validation case to ensure only eligible users can claim, protecting the integrity of the airdrop.

**Independent Test**: This can be tested by any user whose address is not part of the Merkle tree. The test passes if the user attempts to claim and receives an error message, and no tokens are transferred.

**Acceptance Scenarios**:

1.  **Given** a user is NOT on the whitelist,
    **When** they submit a signed message to the backend,
    **Then** the system rejects the request and does not submit a transaction to the blockchain.

---

### User Story 3 - Duplicate Claim Attempt (Priority: P3)

A user who has already successfully claimed their airdrop attempts to claim it again. The system prevents the duplicate claim and informs the user they have already claimed.

**Why this priority**: This prevents abuse of the airdrop system and ensures fairness.

**Independent Test**: This can be tested with a whitelisted user account that has already completed the claim process once. The test passes if the user attempts the claim again and is blocked with an appropriate message.

**Acceptance Scenarios**:

1.  **Given** a user HAS already claimed the airdrop,
    **When** they attempt to submit another claim request,
    **Then** the system (either backend or contract) rejects the request.

---

### Edge Cases

-   What happens if the backend relayer wallet runs out of gas? The system should fail gracefully, log the error, and be able to retry the transaction later.
-   How does the system handle an invalid EIP-712 signature? The on-chain contract MUST revert the transaction with a clear error.
-   What happens if the blockchain network is heavily congested? The system should handle potentially long transaction confirmation times.

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The system MUST provide a mechanism for a user to generate an EIP-712 compliant signature to authorize the airdrop claim.

-   **FR-002**: A backend service MUST expose an endpoint to receive the user's address and the corresponding EIP-712 signature.

-   **FR-003**: The on-chain contract MUST cryptographically verify the EIP-712 signature provided by the user against the `_claimer` address and the intended claim parameters (amount, token address, etc.).

-   **FR-004**: The backend service MUST verify that the user's address is included in the airdrop whitelist by generating and validating a Merkle proof.

-   **FR-005**: The backend service MUST check its records or query the blockchain to ensure the user has not already claimed the airdrop.

-   **FR-006**: The backend service MUST, upon successful *backend* validation (e.g., whitelist, duplicate claim), construct and submit a transaction to the on-chain contract to execute the claim on the user's behalf.

-   **FR-007**: The on-chain contract MUST have a secure claim function that can only be executed by an authorized backend relayer address.

-   **FR-008**: The on-chain claim function MUST accept the user's address, the token amount, the EIP-712 signature, and a Merkle proof as arguments.

-   **FR-009**: The on-chain contract MUST validate the provided Merkle proof against its stored Merkle root.

-   **FR-010**: The on-chain contract MUST track claimed addresses and reject transactions for addresses that have already claimed.

-   **FR-011**: Upon successful validation, the on-chain contract MUST transfer the specified amount of airdrop tokens to the user's address.

### Key Entities

-   **User**: Represents an airdrop participant. Key attributes: `address`, `claimStatus`.
-   **AirdropClaim**: Represents a single claim event. Key attributes: `userAddress`, `tokenAmount`, `signature`.
-   **Whitelist**: Represents the set of eligible users, implemented as a Merkle Tree. Key attribute: `merkleRoot`.
-   **BackendRelayer**: A trusted entity responsible for paying gas fees and submitting transactions. Key attribute: `relayerAddress`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: 100% of valid, whitelisted users can successfully claim their airdrop in a single session.
-   **SC-002**: The end-to-end claim process (from user signature to on-chain confirmation) completes in under 2 minutes during normal network conditions.
-   **SC-003**: 0% of users not on the whitelist are able to claim tokens.
-   **SC-004**: 0% of users are able to claim the airdrop more than once.
-   **SC-005**: The gas cost for the end-user MUST be zero for the entire claim process.

## Assumptions

- A Merkle tree of whitelisted addresses has already been generated, and its root is available to be set in the smart contract.
- The backend system has access to a secure wallet (the "relayer") that is funded with sufficient native currency (e.g., ETH) to cover transaction gas fees.
- The user has a web3 wallet (like MetaMask) capable of signing EIP-712 messages.

## Out of Scope

- The user interface (frontend) for initiating the claim process.
- The generation of the whitelist and its corresponding Merkle tree.
- The process for funding the backend relayer wallet.
- The deployment of the token contract itself.