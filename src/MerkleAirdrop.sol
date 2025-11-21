// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "openzeppelin/contracts/token/ERC20/IERC20.sol";
import "openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // New import for SafeERC20
import "openzeppelin/contracts/utils/Address.sol"; // New import for SafeERC20
import "openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "openzeppelin/contracts/access/Ownable.sol";
import "openzeppelin/contracts/utils/cryptography/EIP712.sol"; // New import
import "openzeppelin/contracts/utils/cryptography/ECDSA.sol"; // New import for ECDSA.recover

contract MerkleAirdrop is Ownable, EIP712 {
    using SafeERC20 for IERC20; // Use SafeERC20 for IERC20

    bytes32 public immutable merkleRoot;
    address public immutable airdropToken;

    mapping(address => bool) public hasClaimed;

    // Custom Errors
    error InvalidMerkleProof();
    error AlreadyClaimed();
    error InvalidSignature();
    error InvalidClaimer();
    error UnauthorizedRelayer(); // For onlyOwner check for claim function

    event Claimed(address indexed claimer, uint256 amount);

    // Define the EIP-712 type hash for the claim
    bytes32 private constant CLAIM_TYPEHASH =
        keccak256("Claim(address claimer,uint256 amount)");

    constructor(
        bytes32 _merkleRoot,
        address _airdropToken,
        string memory _name,
        string memory _version
    )
        Ownable(msg.sender)
        EIP712(_name, _version) // Initialize EIP712
    {
        merkleRoot = _merkleRoot;
        airdropToken = _airdropToken;
    }

    function claim(
        address _claimer,
        uint256 _amount,
        bytes32[] calldata _merkleProof,
        bytes calldata _signature
    ) external onlyOwner {
        // 1. Check if the user has already claimed
        if (hasClaimed[_claimer]) {
            revert AlreadyClaimed();
        }

        // 2. Verify the EIP-712 signature
        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, _claimer, _amount)
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        // By using OpenZeppelin's ECDSA.tryRecover, we prevent signature malleability attacks.
        // The library ensures that the 's' value of the signature is in the lower half of the curve order,
        // accepting only canonical signatures and rejecting malleable ones.
        (bool success, address signer) = ECDSA.tryRecover(digest, _signature);

        if (!success || signer == address(0)) {
            revert InvalidSignature();
        }
        if (signer != _claimer) {
            revert InvalidClaimer();
        }

        // 3. Verify the Merkle Proof
        bytes32 leaf = keccak256(abi.encodePacked(_claimer, _amount));
        if (!MerkleProof.verify(_merkleProof, merkleRoot, leaf)) {
            revert InvalidMerkleProof();
        }

        // 4. Mark as claimed and emit event
        hasClaimed[_claimer] = true;
        emit Claimed(_claimer, _amount);

        // 5. Transfer the tokens
        IERC20(airdropToken).safeTransfer(_claimer, _amount); // Use safeTransfer
    }
}
