import { ethers } from "ethers";
import fs from 'fs';
import path from 'path';
import MerkleAirdrop from "../../../out/MerkleAirdrop.sol/MerkleAirdrop.json";
import logger from "../utils/logger";

const AIRDROP_CONTRACT_ADDRESS = process.env.AIRDROP_CONTRACT_ADDRESS;
const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
const merkleTreePath = path.join(__dirname, "../../scripts/merkle-tree.json");

if (!relayerPrivateKey) {
  logger.error("RELAYER_PRIVATE_KEY environment variable not set");
  throw new Error("RELAYER_PRIVATE_KEY environment variable not set");
}

if (!AIRDROP_CONTRACT_ADDRESS) {
  logger.error("AIRDROP_CONTRACT_ADDRESS environment variable not set");
  throw new Error("AIRDROP_CONTRACT_ADDRESS environment variable not set");
}

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
const airdropContract = new ethers.Contract(
  AIRDROP_CONTRACT_ADDRESS,
  MerkleAirdrop.abi,
  relayerWallet
);

const getMerkleData = () => {
  if (!fs.existsSync(merkleTreePath)) {
    throw new Error("Merkle tree not generated yet.");
  }
  return JSON.parse(fs.readFileSync(merkleTreePath, "utf8"));
};

export const relayClaim = async (
  claimer: string,
  amount: string,
  merkleProof: string[],
  signature: string
): Promise<ethers.providers.TransactionResponse> => {
  const context = { claimer, amount };
  try {
    const code = await provider.getCode(AIRDROP_CONTRACT_ADDRESS as string);
    if (code === '0x') {
      logger.error("Airdrop contract not deployed at configured address", context);
      throw new Error("Airdrop contract not deployed at configured address");
    }
    logger.info("Checking whitelist status", context);
    const merkleTree = getMerkleData();
    
    const isWhitelisted = merkleTree.airdropData.some(
      (entry: any) => entry.address.toLowerCase() === claimer.toLowerCase()
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
      { gasLimit: 500000 } 
    );
    return tx;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("Error relaying claim", { ...context, error: errorMessage });
    throw error; // Re-throw to be handled by the controller
  }
};
