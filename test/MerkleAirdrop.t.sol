// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {MerkleAirdrop} from "../src/MerkleAirdrop.sol";
import {AirdropToken} from "../src/tokens/AirdropToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

contract MerkleAirdropTest is Test {
    using stdJson for string;

    MerkleAirdrop public airdrop;
    AirdropToken public airdropToken;

    bytes32 public MERKLE_ROOT;
    string public constant NAME = "Airdrop";
    string public constant VERSION = "1";
    address private owner;
    address private relayer;

    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    function setUp() public virtual {
        owner = address(this);
        relayer = address(this); // For simplicity in tests, owner is also relayer

        vm.prank(owner);
        airdropToken = new AirdropToken("Airdrop Token", "ADT");

        string memory json = vm.readFile("./backend/scripts/merkle-tree.json");
        MERKLE_ROOT = vm.parseJsonBytes32(json, ".merkleRoot");

        vm.prank(owner);
        airdrop = new MerkleAirdrop(address(airdropToken), NAME, VERSION);

        vm.prank(owner);
        airdrop.updateMerkleRoot(MERKLE_ROOT);

        // Grant RELAYER_ROLE to relayer using the new method
        vm.prank(owner);
        airdrop.grantRelayerRole(relayer);
    }

    function test_claim_success() public {
        string memory json = vm.readFile("./backend/scripts/merkle-tree.json");
        address claimer = vm.parseJsonAddress(json, ".airdropData[0].address");
        uint256 amount = vm.parseJsonUint(json, ".airdropData[0].amount");
        bytes32[] memory merkleProof = vm.parseJsonBytes32Array(json, ".airdropData[0].proof");

        airdropToken.mint(address(airdrop), 100 ether);

        bytes32 digest = airdrop.getMessageHash(claimer, amount);

        uint256 claimerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(claimerPrivateKey, digest);

        uint256 initialClaimerBalance = airdropToken.balanceOf(claimer);

        vm.expectEmit(true, true, false, true);
        emit MerkleAirdrop.Claimed(claimer, amount);

        vm.prank(relayer);
        airdrop.claim(claimer, amount, merkleProof, abi.encodePacked(r, s, v));

        assertEq(airdropToken.balanceOf(claimer), initialClaimerBalance + amount, "Claimer did not receive tokens");
        assertTrue(airdrop.hasClaimed(claimer), "Claimer status not updated");
    }

    function test_claim_fails_for_non_whitelisted_user() public {
        address nonWhitelistedUser = vm.addr(2);
        uint256 amount = 1e18;
        bytes32[] memory invalidMerkleProof;

        bytes32 digest = airdrop.getMessageHash(nonWhitelistedUser, amount);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(2, digest);

        vm.prank(relayer);
        vm.expectRevert(MerkleAirdrop.InvalidMerkleProof.selector);
        airdrop.claim(nonWhitelistedUser, amount, invalidMerkleProof, abi.encodePacked(r, s, v));

        assertEq(airdropToken.balanceOf(nonWhitelistedUser), 0, "Non-whitelisted user received tokens");
        assertFalse(airdrop.hasClaimed(nonWhitelistedUser), "Non-whitelisted user status updated");
    }

    function test_claim_fails_on_duplicate_claim() public {
        string memory json = vm.readFile("./backend/scripts/merkle-tree.json");
        address claimer = vm.parseJsonAddress(json, ".airdropData[0].address");
        uint256 amount = vm.parseJsonUint(json, ".airdropData[0].amount");
        bytes32[] memory merkleProof = vm.parseJsonBytes32Array(json, ".airdropData[0].proof");

        airdropToken.mint(address(airdrop), 200 ether);

        bytes32 digest = airdrop.getMessageHash(claimer, amount);

        uint256 claimerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(claimerPrivateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(relayer);
        airdrop.claim(claimer, amount, merkleProof, signature);

        vm.prank(relayer);
        vm.expectRevert(MerkleAirdrop.AlreadyClaimed.selector);
        airdrop.claim(claimer, amount, merkleProof, signature);
    }

    function test_claim_fails_with_invalid_signature() public {
        string memory json = vm.readFile("./backend/scripts/merkle-tree.json");
        address claimer = vm.parseJsonAddress(json, ".airdropData[0].address");
        uint256 amount = vm.parseJsonUint(json, ".airdropData[0].amount");
        bytes32[] memory merkleProof = vm.parseJsonBytes32Array(json, ".airdropData[0].proof");

        airdropToken.mint(address(airdrop), 100 ether);

        bytes32 digest = airdrop.getMessageHash(claimer, amount);

        // Sign with a different private key
        uint256 maliciousPrivateKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d; // Anvil account 2
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(maliciousPrivateKey, digest);

        vm.prank(relayer);
        vm.expectRevert(MerkleAirdrop.InvalidClaimer.selector);
        airdrop.claim(claimer, amount, merkleProof, abi.encodePacked(r, s, v));
    }

    function test_claim_fails_with_truly_invalid_signature() public {
        string memory json = vm.readFile("./backend/scripts/merkle-tree.json");
        address claimer = vm.parseJsonAddress(json, ".airdropData[0].address");
        uint256 amount = vm.parseJsonUint(json, ".airdropData[0].amount");
        bytes32[] memory merkleProof = vm.parseJsonBytes32Array(json, ".airdropData[0].proof");

        airdropToken.mint(address(airdrop), 100 ether);

        bytes32 digest = airdrop.getMessageHash(claimer, amount);

        uint256 claimerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        (, bytes32 r, bytes32 s) = vm.sign(claimerPrivateKey, digest);

        // Tamper with the signature
        bytes memory invalidSignature = abi.encodePacked(r, s, uint8(0));

        vm.prank(relayer);
        vm.expectRevert(MerkleAirdrop.InvalidSignature.selector);
        airdrop.claim(claimer, amount, merkleProof, invalidSignature);
    }

    function test_updateMerkleRoot_success() public {
        bytes32 newMerkleRoot = keccak256("newMerkleRoot");

        vm.prank(owner); // owner has DEFAULT_ADMIN_ROLE
        airdrop.updateMerkleRoot(newMerkleRoot);

        assertEq(airdrop.merkleRoot(), newMerkleRoot);
    }

    function test_updateMerkleRoot_fails_if_not_admin() public {
        bytes32 newMerkleRoot = keccak256("newMerkleRoot");
        address nonAdmin = vm.addr(2);

        vm.prank(nonAdmin);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, nonAdmin, DEFAULT_ADMIN_ROLE
            )
        );
        airdrop.updateMerkleRoot(newMerkleRoot);
    }

    function test_claim_fails_if_not_relayer() public {
        string memory json = vm.readFile("./backend/scripts/merkle-tree.json");
        address claimer = vm.parseJsonAddress(json, ".airdropData[0].address");
        uint256 amount = vm.parseJsonUint(json, ".airdropData[0].amount");
        bytes32[] memory merkleProof = vm.parseJsonBytes32Array(json, ".airdropData[0].proof");

        bytes32 digest = airdrop.getMessageHash(claimer, amount);
        uint256 claimerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(claimerPrivateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        address nonRelayer = vm.addr(3);

        vm.prank(nonRelayer);
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, nonRelayer, RELAYER_ROLE)
        );
        airdrop.claim(claimer, amount, merkleProof, signature);
    }
}
