# Checklist: On-Chain Security & Correctness

**Purpose**: A rigorous checklist for a peer reviewer to conduct a pre-deployment security review of the on-chain smart contract components.
**Created**: 2025-11-21
**Feature**: [spec.md](./../spec.md)

---

## Requirement Completeness

- [ ] CHK001 - Are all on-chain roles (e.g., owner, relayer) and their permissions explicitly defined in the requirements? [Completeness, Spec §FR-007]
- [ ] CHK002 - Are the requirements for the EIP-712 domain separator (name, version) clearly specified? [Completeness, Spec §FR-001]
- [ ] CHK003 - Does the specification define the exact data types and order for the `CLAIM_TYPEHASH`? [Completeness, Spec §FR-003]
- [ ] CHK004 - Are events for all critical state changes (e.g., Claimed, OwnershipTransferred) specified? [Completeness, Gap]
- [ ] CHK005 - Are requirements for contract upgradeability or immutability explicitly stated? [Completeness, Gap]

---

## Requirement Clarity & Specificity

- [ ] CHK006 - Is the definition of "authorized backend relayer" clear and unambiguous? [Clarity, Spec §FR-007]
- [ ] CHK007 - Are the claim parameters (`_claimer`, `_amount`) that are part of the EIP-712 signature explicitly listed and typed in the spec? [Clarity, Spec §FR-003, §FR-008]
- [ ] CHK008 - Does the specification clarify whether the `_amount` is the raw token amount (e.g., including decimals) or a human-readable number? [Clarity, Ambiguity]

---

## Security: Access Control

- [ ] CHK009 - Does the `claim` function's access control requirement (`onlyOwner` / `onlyRelayer`) match the implementation? [Traceability, Spec §FR-007]
- [ ] CHK010 - Is there a requirement to prevent a regular user from calling the `claim` function directly? [Security, Spec §FR-007]
- [ ] CHK011 - Are the ownership and administrative functions (e.g., changing the relayer address) clearly defined and protected? [Security, Gap]
- [ ] CHK012 - Does the spec address the risk of a compromised relayer key? Are there requirements for a mechanism to pause or change the relayer? [Security, Gap]

---

## Security: Signature & Proof Validation

- [ ] CHK013 - Does the specification explicitly require protection against signature replay attacks (e.g., using a nonce or the `hasClaimed` flag)? [Security, Spec §FR-010]
- [ ] CHK014 - Is there a requirement for the contract to use a secure and tested EIP-712 verification library (e.g., OpenZeppelin's)? [Security, Spec §FR-003]
- [ ] CHK015 - Is there a requirement to protect against signature malleability? [Security, Gap]
- [ ] CHK016 - Does the specification require the Merkle proof verification to use a secure and tested library? [Security, Spec §FR-009]
- [ ] CHK017 - Is the leaf node construction (`keccak256(abi.encodePacked(_claimer, _amount))`) clearly and correctly defined in the requirements? [Security, Spec §FR-009]

---

## Security: Denial of Service & Gas Limits

- [ ] CHK018 - Are there any requirements regarding gas limits for the `claim` function to prevent out-of-gas errors for valid users? [Coverage, Spec §SC-002]
- [ ] CHK019 - Does the specification consider the gas cost implications of the Merkle proof validation, especially for proofs with high depth? [Coverage, Gap]
- [ ] CHK020 - Are there any unbounded loops or operations in the on-chain logic that could lead to a denial of service? [Security, Gap]

---

## Scenario & Edge Case Coverage

- [ ] CHK021 - Does the specification define the required on-chain behavior if the contract does not have a sufficient token balance to fulfill a claim? [Edge Case, Gap]
- [ ] CHK022 - Is the required contract behavior for a claim of `amount = 0` defined? [Edge Case, Gap]
- [ ] CHK023 - Is the on-chain error handling (e.g., revert reasons) for each failure scenario (invalid proof, duplicate claim, invalid signature) specified? [Clarity, Spec §Edge Cases]
- [ ] CHK024 - Does the specification account for the case where the `_claimer` address is `address(0)`? [Edge Case, Gap]

---

## Measurability & Acceptance Criteria

- [ ] CHK025 - Are the success criteria for on-chain validation (SC-003, SC-004) objectively measurable through on-chain data? [Measurability, Spec §SC-003, §SC-004]
- [ ] CHK026 - Can the requirement "cryptographically verify the EIP-712 signature" (FR-003) be tested with a clear pass/fail outcome? [Measurability, Spec §FR-003]
- [ ] CHK027 - Is the "zero gas cost for the end-user" requirement (SC-005) verifiable by inspecting the on-chain transaction data? [Measurability, Spec §SC-005]
