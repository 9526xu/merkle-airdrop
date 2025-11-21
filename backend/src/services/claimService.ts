import { ethers } from "ethers";
import MerkleAirdrop from "../../../out/MerkleAirdrop.sol/MerkleAirdrop.json";
import merkleTree from "../../scripts/merkle-tree.json";
import logger from "../utils/logger";

const AIRDROP_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;

if (!relayerPrivateKey) {
  logger.error("RELAYER_PRIVATE_KEY environment variable not set");
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
  const context = { claimer, amount };
  try {
    logger.info("Checking whitelist status", context);
    const isWhitelisted = merkleTree.airdropData.some(
      (entry) => entry.address.toLowerCase() === claimer.toLowerCase()
    );

    if (!isWhitelisted) {
      logger.error("User is not in the whitelist", context);
      throw new Error("User is not in the whitelist");
    }

    logger.info("Checking if user has already claimed", context);
    const hasClaimed = await airdropContract.hasClaimed(claimer);
    if (hasClaimed) {
      logger.error("User has already claimed the airdrop", context);
      throw new Error("User has already claimed the airdrop");
    }

    logger.info("Relaying claim transaction", context);
    const tx = await airdropContract.claim(
      claimer,
      amount,
      merkleProof,
      signature,
      { gasLimit: 300000 }
    );
    return tx;
  } catch (error: any) {
    logger.error("Error relaying claim", { ...context, error: error.message });
    throw new Error("Failed to relay claim transaction.");
  }
};
