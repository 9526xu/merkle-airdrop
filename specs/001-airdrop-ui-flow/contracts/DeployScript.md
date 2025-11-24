# Deployment Script Specification

**File**: `script/DeployMerkleAirdrop.s.sol`

## Objective
Automate the deployment of the `MerkleAirdrop` contract, including dependency handling (ERC20 token) and role configuration.

## Configuration Input
The script must read the following environment variables:
- `PRIVATE_KEY`: Deployer wallet.
- `AIRDROP_TOKEN_ADDRESS`: (Optional) Address of existing token. If missing, deploy a mock.

## Script Logic (Pseudo-code)

```solidity
contract DeployMerkleAirdrop is Script {
    function run() external returns (MerkleAirdrop, IERC20) {
        vm.startBroadcast();

        // 1. Token Handling
        IERC20 token;
        address tokenAddress = vm.envOr("AIRDROP_TOKEN_ADDRESS", address(0));
        
        if (tokenAddress == address(0)) {
            // Deploy Mock Token for testing/dev
            AirdropToken mockToken = new AirdropToken();
            token = IERC20(address(mockToken));
        } else {
            token = IERC20(tokenAddress);
        }

        // 2. Deploy Airdrop Contract
        // Initialize with empty root (root updated later by admin)
        MerkleAirdrop airdrop = new MerkleAirdrop(
            token, 
            bytes32(0) 
        );

        // 3. Transfer Tokens to Airdrop (if deploying mock)
        if (tokenAddress == address(0)) {
             AirdropToken(address(token)).mint(address(airdrop), 1000000 ether);
        }

        vm.stopBroadcast();
        return (airdrop, token);
    }
}
```

## Output Artifacts
- `broadcast/` logs containing deployment addresses.
- ABI files in `out/`.
