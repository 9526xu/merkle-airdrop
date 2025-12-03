# Quickstart Guide: Frontend & Deployment

**Feature**: `001-airdrop-ui-flow`

## Prerequisites
- Node.js 18+
- Foundry (`forge`)
- Bun or Yarn or NPM

## 1. Smart Contract Setup

### Deploy to Local Chain (Anvil)
1. Start local chain:
   ```bash
   anvil
   ```
2. Run deployment script:
   ```bash
   forge script script/DeployMerkleAirdrop.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
   *(Note: Private key is Anvil's default account #0)*

3. Copy the deployed `MerkleAirdrop` address from the output.

## 2. Frontend Setup

### Installation
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Create `.env.local` in `frontend/`:
```bash
NEXT_PUBLIC_AIRDROP_ADDRESS=0x... (paste from step 1)
NEXT_PUBLIC_CHAIN_ID=31337 (Anvil)
ADMIN_PASSWORD=admin123 (For MVP demo)
```

### Running the App
```bash
npm run dev
```
Visit `http://localhost:3000`.

## 3. User Flow Walkthrough
1. **User**: Go to `http://localhost:3000/user`. Connect Wallet. Click "Join Whitelist".
2. **Admin**: Go to `http://localhost:3000/admin`. Login. Click "Stop Collection" -> "Generate Tree" -> "Update Root".
3. **User**: Refresh `http://localhost:3000/user`. See "Claim" button. Click to claim.
