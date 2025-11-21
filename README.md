# Merkle Airdrop

This project implements a gasless Merkle airdrop system using on-chain EIP-712 signature verification. A backend relayer pays for the gas fees, allowing whitelisted users to claim their airdrop without needing any native currency (e.g., ETH).

## Features

- **Gasless Claims**: Users can claim their airdrop tokens without paying for gas.
- **Secure Whitelist**: A Merkle tree is used to efficiently and securely verify a user's inclusion in the airdrop.
- **EIP-712 Signature Verification**: The smart contract verifies the user's signature on-chain, ensuring that only the legitimate owner can claim.
- **Backend Relayer**: A Node.js backend service relays the user's claim to the blockchain.

## Tech Stack

### On-Chain
- **Solidity**: Smart contract language
- **Foundry**: Ethereum development toolkit
- **OpenZeppelin Contracts**: Library for secure smart contract development

### Off-Chain
- **Node.js**: JavaScript runtime environment
- **TypeScript**: Typed superset of JavaScript
- **Express.js**: Web framework for Node.js
- **Ethers.js**: Library for interacting with Ethereum
- **MerkleTree.js**: Library for generating Merkle trees

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── api/         # Express router and API endpoint
│   │   ├── services/    # Business logic for relaying claims
│   │   └── utils/       # Utility functions (e.g., logger)
│   ├── scripts/
│   │   ├── generate-merkle-tree.js # Script to generate the Merkle tree
│   │   └── whitelist.json          # List of whitelisted addresses and amounts
│   └── test/
├── lib/
├── out/
├── script/
├── src/
│   ├── tokens/
│   │   └── AirdropToken.sol  # ERC20 token for the airdrop
│   └── MerkleAirdrop.sol     # Main airdrop contract
└── test/
    └── MerkleAirdrop.t.sol   # Foundry tests for the smart contract
```

## Getting Started

### Prerequisites

- [Foundry](https://getfoundry.sh)
- [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**
    ```shell
    git clone https://github.com/your-username/merkle-airdrop.git
    cd merkle-airdrop
    ```

2.  **Install smart contract dependencies:**
    ```shell
    forge install
    ```

3.  **Install backend dependencies:**
    ```shell
    cd backend
    npm install
    cd ..
    ```

### Configuration

1.  **Create a whitelist file:**
    Create a `backend/scripts/whitelist.json` file with the airdrop data. See `backend/scripts/whitelist.json.example` for the format.

2.  **Generate the Merkle tree:**
    ```shell
    cd backend
    node scripts/generate-merkle-tree.js
    cd ..
    ```
    This will create a `backend/scripts/merkle-tree.json` file containing the Merkle root and proofs.

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add your relayer's private key. See `backend/.env.example` for the format.
    ```
    RELAYER_PRIVATE_KEY=your_relayer_private_key_here
    ```

### Running the project

1.  **Start a local blockchain node:**
    ```shell
    anvil
    ```

2.  **Deploy the smart contracts:**
    Update the `script/MerkleAirdrop.s.sol` with the merkle root from `backend/scripts/merkle-tree.json` and then run:
    ```shell
    forge script script/MerkleAirdrop.s.sol:MerkleAirdropScript --rpc-url http://127.0.0.1:8545 --private-key <your_deployer_private_key> --broadcast
    ```

3.  **Start the backend relayer:**
    ```shell
    cd backend
    npm start
    ```

## API Reference

### POST /claim

Relays a user's claim to the smart contract.

**Request Body:**

```json
{
  "claimer": "0x...",
  "amount": "1000000000000000000",
  "merkleProof": ["0x...", "0x..."],
  "signature": "0x..."
}
```

**Success Response:**

```json
{
  "transactionHash": "0x..."
}
```

**Error Responses:**

- **400 Bad Request**: Missing required claim data.
- **403 Forbidden**: User is not in the whitelist.
- **409 Conflict**: User has already claimed the airdrop.
- **500 Internal Server Error**: Failed to process the claim.

## Testing

### Smart Contracts

Run the Foundry tests:

```shell
forge test
```

### Backend

Run the Jest tests:

```shell
cd backend
npm test
```
