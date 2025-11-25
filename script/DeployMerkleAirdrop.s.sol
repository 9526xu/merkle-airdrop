// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MerkleAirdrop} from "../src/MerkleAirdrop.sol";
import {AirdropToken} from "../src/tokens/AirdropToken.sol";
import {console} from "forge-std/console.sol";

contract DeployMerkleAirdrop is Script {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant ROOT = bytes32(0); // Initial root can be empty
    uint256 public constant AMOUNT_TO_MINT = 100 ether * 100;

    function run() external returns (MerkleAirdrop, AirdropToken) {
        vm.startBroadcast();

        // Deploy Token
        AirdropToken airdropToken = new AirdropToken("Airdrop Token", "ADT");
        console.log("AirdropToken deployed at:", address(airdropToken));

        // Deploy Airdrop Contract
        MerkleAirdrop airdrop = new MerkleAirdrop(
            ROOT,
            address(airdropToken),
            "Airdrop",
            "1"
        );
        console.log("MerkleAirdrop deployed at:", address(airdrop));

        // Mint tokens to Airdrop contract
        airdropToken.mint(address(airdrop), AMOUNT_TO_MINT);
        console.log("Minted tokens to Airdrop contract");

        // Setup Roles (Default Admin is already msg.sender from constructor)
        // Example: Grant Relayer Role to a specific address if needed (e.g., a backend service)
        // For now, we might want to grant it to the deployer for testing purposes
        airdrop.grantRelayerRole(msg.sender);
        console.log("Granted RELAYER_ROLE to deployer:", msg.sender);

        vm.stopBroadcast();
        return (airdrop, airdropToken);
    }
}
