// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {MerkleAirdrop} from "../src/MerkleAirdrop.sol";
import {AirdropToken} from "../src/tokens/AirdropToken.sol";
import {IERC20} from "openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MerkleAirdropTest is Test {
    MerkleAirdrop public airdrop;
    AirdropToken public airdropToken;

    bytes32 public MERKLE_ROOT;
    string public constant NAME = "Airdrop";
    string public constant VERSION = "1";

    // EIP-712 domain separator components
    uint256 public CHAIN_ID;
    address public DOMAIN_SEPARATOR_ADDRESS;
    bytes32 public DOMAIN_SEPARATOR;

    // Helper to hash EIP-712 messages
    function _hashTypedDataV4(bytes32 structHash) internal view returns (bytes32) {
        return EIP712.hashTypedDataV4(
            DOMAIN_SEPARATOR,
            structHash
        );
    }

    function setUp() public virtual {
        CHAIN_ID = block.chainid;
        
        airdropToken = new AirdropToken("Airdrop Token", "ADT");

        // Placeholder Merkle Root for now, will be replaced with real one from script
        MERKLE_ROOT = keccak256(abi.encodePacked("placeholder_root"));

        airdrop = new MerkleAirdrop(MERKLE_ROOT, address(airdropToken), NAME, VERSION);

        // Calculate EIP-712 domain separator
        DOMAIN_SEPARATOR_ADDRESS = address(airdrop); // Set after airdrop is initialized
        DOMAIN_SEPARATOR = airdrop.DOMAIN_SEPARATOR();
    }

    // EIP-712 Claim Type Hash (must match the one in MerkleAirdrop.sol)
    bytes32 constant CLAIM_TYPEHASH_TEST = keccak256("Claim(address claimer,uint256 amount)");

    function test_claim_success() public {
        address claimer = vm.addr(1); // Test user
        uint256 amount = 1e18; // 1 token
        bytes32[] memory merkleProof; // Placeholder for now

        // 1. Setup AirdropToken balance for the airdrop contract
        airdropToken.mint(address(airdrop), 100 ether); // Mint some tokens to the airdrop contract

        // 2. Prepare the EIP-712 message hash
        bytes32 claimStructHash = keccak256(abi.encode(
            CLAIM_TYPEHASH_TEST,
            claimer,
            amount
        ));
        bytes32 digest = _hashTypedDataV4(claimStructHash);

        // 3. Sign the digest with the claimer's private key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, digest); // Sign with test user's private key

        // 4. Record initial balance
        uint256 initialClaimerBalance = airdropToken.balanceOf(claimer);

        // 5. Simulate claim from the backend relayer (e.g., msg.sender is owner)
        vm.prank(owner); // Owner (relayer) calls the claim function
        airdrop.claim(claimer, amount, merkleProof, abi.encodePacked(r, s, v));

        // 6. Assert successful claim
        assertEq(airdropToken.balanceOf(claimer), initialClaimerBalance + amount, "Claimer did not receive tokens");
        assertTrue(airdrop.hasClaimed(claimer), "Claimer status not updated");
    }

    function test_claim_fails_for_non_whitelisted_user() public {
        address claimer = vm.addr(2); // Another test user, not in any valid whitelist
        uint256 amount = 1e18; // 1 token
        bytes32[] memory invalidMerkleProof; // An empty or invalid proof

        // 1. Prepare the EIP-712 message hash
        bytes32 claimStructHash = keccak256(abi.encode(
            CLAIM_TYPEHASH_TEST,
            claimer,
            amount
        ));
        bytes32 digest = _hashTypedDataV4(claimStructHash);

        // 2. Sign the digest with the claimer's private key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(2, digest); // Sign with test user's private key

        // 3. Simulate claim from the backend relayer and expect revert
        vm.prank(owner); // Owner (relayer) calls the claim function
        vm.expectRevert(MerkleAirdrop.InvalidMerkleProof.selector); // Expect revert from Merkle proof validation
        airdrop.claim(claimer, amount, invalidMerkleProof, abi.encodePacked(r, s, v));

        // 4. Assert no token transfer and no status update
        assertEq(airdropToken.balanceOf(claimer), 0, "Non-whitelisted user received tokens");
        assertFalse(airdrop.hasClaimed(claimer), "Non-whitelisted user status updated");
    }

    function test_claim_fails_on_duplicate_claim() public {
        address claimer = vm.addr(1); // Test user from the first test
        uint256 amount = 1e18; // 1 token
        bytes32[] memory merkleProof; // Placeholder for now

        // 1. Setup AirdropToken balance
        airdropToken.mint(address(airdrop), 200 ether);

        // 2. Prepare EIP-712 message hash
        bytes32 claimStructHash = keccak256(abi.encode(
            CLAIM_TYPEHASH_TEST,
            claimer,
            amount
        ));
        bytes32 digest = _hashTypedDataV4(claimStructHash);

        // 3. Sign the digest
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        // 4. First claim (should succeed)
        vm.prank(owner);
        airdrop.claim(claimer, amount, merkleProof, signature);

        // 5. Second claim (should fail)
        vm.prank(owner);
        vm.expectRevert(MerkleAirdrop.AlreadyClaimed.selector);
        airdrop.claim(claimer, amount, merkleProof, signature);
    }
}