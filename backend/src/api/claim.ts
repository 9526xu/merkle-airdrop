import { Router, Request, Response } from "express";
import { relayClaim } from "../services/claimService";

const router = Router();

router.post("/claim", async (req: Request, res: Response) => {
  const { claimer, amount, merkleProof, signature } = req.body;

  if (!claimer || !amount || !merkleProof || !signature) {
    return res.status(400).json({ error: "Missing required claim data." });
  }

  try {
    const txResponse = await relayClaim(
      claimer,
      amount,
      merkleProof,
      signature
    );
    res.status(200).json({ transactionHash: txResponse.hash });
  } catch (error) {
    res.status(500).json({ error: "Failed to process claim." });
  }
});

export default router;
