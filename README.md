# Merkle Airdrop

This project implements a gasless Merkle airdrop system using on-chain EIP-712 signature verification. It includes a full-stack application (Next.js Frontend + Express Backend + Foundry Contracts) allowing users to register for a whitelist and claim tokens gaslessly.

## Features

- **User Registration**: Users connect their wallet and join a whitelist (stored off-chain).
- **Admin Dashboard**: Admin generates the Merkle Tree from the whitelist and updates the on-chain Merkle Root.
- **Gasless Claims**: Whitelisted users can claim tokens without paying gas (Relayer pattern).
- **Secure**: EIP-712 signatures ensure only the legitimate owner can claim.

## Tech Stack

- **Contracts**: Solidity 0.8.20, Foundry, OpenZeppelin
- **Frontend**: Next.js 14 (App Router), Wagmi, RainbowKit, Tailwind CSS
- **Backend**: Node.js, Express, MerkleTree.js

## Project Structure

```
.
├── frontend/            # Next.js Application (User & Admin UI)
├── backend/
│   ├── data/            # Storage for whitelist.json and settings.json
│   ├── src/
│   │   ├── api/         # API Routes (Whitelist, Admin, Claim)
│   │   └── services/    # Relayer Logic
│   └── scripts/         # Merkle Tree generation logic
├── script/              # Foundry Deployment Scripts
├── src/                 # Smart Contracts
└── test/                # Foundry Tests
```

## Getting Started

### Prerequisites
- [Foundry](https://getfoundry.sh)
- [Node.js](https://nodejs.org) (v18+) & npm

### 1. Setup Local Blockchain
Start Anvil (local chain):
```shell
anvil
```
*Keep this terminal running.*

### 2. Deploy Contracts
In a new terminal, deploy the contracts to Anvil.
```shell
forge script script/DeployMerkleAirdrop.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
**Important:** Copy the `MerkleAirdrop` contract address from the output. You will need it for the frontend configuration.

### 3. Start Backend
Configure and start the Express server.
```shell
cd backend
cp .env.example .env
```
Open `backend/.env` and ensure `RELAYER_PRIVATE_KEY` is set. For local development with Anvil, you can use one of the default private keys (e.g., Account #0: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).

```shell
npm install
npm start
```
Server runs on `http://localhost:3001`.

### 4. Start Frontend
Configure and run the Next.js app.
```shell
cd frontend
cp .env.example .env.local
```
Open `frontend/.env.local` and update the contract address:
```env
NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS_31337=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
```
*Note: Ensure other variables like `NEXT_PUBLIC_API_BASE_URL` are pointing to your local backend (default: `http://localhost:3001/api`).*

```shell
npm install
npm run dev
```
App runs on `http://localhost:3000`.

## Usage Flow

1.  **User Registration** (Status: `COLLECTION`):
    - Go to `http://localhost:3000/user`.
    - Connect Wallet (Use Anvil Account #1, #2, etc.).
    - Click "Join Whitelist".

2.  **Admin Processing**:
    - Go to `http://localhost:3000/admin`.
    - Login with password: `admin123`.
    - **Phase 1**: Click "PROCESSING" to stop new registrations.
    - **Phase 2**: Click "Generate Merkle Tree" (creates proof off-chain).
    - **Phase 3**: Click "Update Contract Root" (sends transaction on-chain).
    - **Phase 4**: Click "CLAIM" to enable user claims.

3.  **User Claim** (Status: `CLAIM`):
    - Go back to `http://localhost:3000/user`.
    - Refresh to see Allocation.
    - Click "Claim Tokens (Gasless)".
    - Sign the message.
    - Success! Tokens transferred without user paying gas.

## Development

- **Contracts**: `forge test`
- **Backend**: `cd backend && npm test`
