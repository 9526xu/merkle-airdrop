import { ethers } from "ethers";
import MerkleAirdrop from "../../../out/MerkleAirdrop.sol/MerkleAirdrop.json";

const AIRDROP_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;

if (!relayerPrivateKey) {
  throw new Error("RELAYER_PRIVATE_KEY environment variable not set");
}

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); // Replace with your provider
const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
const airdropContract = new ethers.Contract(
  AIRDROP_CONTRACT_ADDRESS,
  MerkleAirdrop.abi,
  relayerWallet
);

export const relayClaim = async (
  claimer: string,
  amount: string,
  merkleProof: string[],
  signature: string
): Promise<ethers.providers.TransactionResponse> => {
  try {
    const tx = await airdropContract.claim(
      claimer,
      amount,
      merkleProof,
      signature,
      { gasLimit: 300000 }
    );
    return tx;
  } catch (error) {
    console.error("Error relaying claim:", error);
    throw new Error("Failed to relay claim transaction.");
  }
};
