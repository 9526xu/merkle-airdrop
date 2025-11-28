import { Router, Request, Response } from "express";
import { relayClaim } from "../services/claimService";
import { getSettings } from "../utils/settings";
import logger from "../utils/logger";

const router = Router();

router.post("/claim", async (req: Request, res: Response) => {
  const { claimer, amount, merkleProof, signature } = req.body;
  const context = { body: req.body, claimer };

  logger.info("Received claim request", context);

  // Check System Status
  const settings = await getSettings();
  if (settings.status !== 'CLAIM') {
      logger.warn("Claim attempted during closed phase", context);
      return res.status(403).json({ error: 'Airdrop claiming is not active.' });
  }

  if (!claimer || !amount || !merkleProof || !signature) {
    logger.error("Missing required claim data", context);
    return res.status(400).json({ error: "Missing required claim data." });
  }

  try {
    const txResponse = await relayClaim(
      claimer,
      amount,
      merkleProof,
      signature
    );
    logger.info("Claim processed successfully", { ...context, transactionHash: txResponse.hash });
    res.status(200).json({ transactionHash: txResponse.hash });
  } catch (error: any) {
    logger.error("Failed to process claim", { ...context, error: error.message });
    if (error.message.includes("Airdrop contract not deployed")) {
      return res.status(500).json({ error: "Airdrop contract not deployed at configured address" });
    }
    if (error.message.includes("User is not in the whitelist")) {
      return res.status(403).json({ error: "User is not in the whitelist." });
    }
    if (error.message.includes("User has already claimed the airdrop")) {
      return res
        .status(409)
        .json({ error: "User has already claimed the airdrop." });
    }
    res.status(500).json({ error: "Failed to process claim." });
  }
});

export default router;
