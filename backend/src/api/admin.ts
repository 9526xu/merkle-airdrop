import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { MerkleGenerator, WhitelistEntry } from '../utils/merkle';
import { getSettings, saveSettings } from '../utils/settings';

const router = Router();

const outputDir = process.env.MERKLE_OUTPUT_DIR || 'data';
const resolvedOutputDir = path.isAbsolute(outputDir) 
  ? outputDir 
  : path.join(__dirname, '../../', outputDir);

// Ensure output directory exists
if (!fs.existsSync(resolvedOutputDir)) {
  fs.mkdirSync(resolvedOutputDir, { recursive: true });
}

const whitelistPath = path.join(resolvedOutputDir, 'whitelist.json');
const merkleTreePath = path.join(resolvedOutputDir, 'merkle-tree.json');

// Middleware for admin auth
const checkAdmin = (req: Request, res: Response, next: Function) => {
    const { password } = req.body;
    // Check body password or header x-admin-password
    const pwd = password || req.headers['x-admin-password'];
    
    if (pwd !== 'admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

router.get('/status', async (req: Request, res: Response) => {
    const settings = await getSettings();
    res.json(settings);
});

router.post('/status', checkAdmin, async (req: Request, res: Response) => {
    const { status } = req.body;
    if (status !== 'COLLECTION' && status !== 'PROCESSING' && status !== 'CLAIM') {
        return res.status(400).json({ error: 'Invalid status. Must be COLLECTION, PROCESSING or CLAIM.' });
    }
    const updated = await saveSettings({ status });
    res.json(updated);
});

router.post('/generate-tree', checkAdmin, async (req: Request, res: Response) => {
  // Validate system state
  const settings = await getSettings();
  if (settings.status !== 'PROCESSING') {
      return res.status(400).json({ error: 'Cannot generate tree. Status must be PROCESSING (whitelist frozen).' });
  }

  if (!fs.existsSync(whitelistPath)) {

    return res.status(404).json({ error: "Whitelist not found" });
  }

  try {
    const whitelist: WhitelistEntry[] = JSON.parse(
      fs.readFileSync(whitelistPath, "utf8")
    );

    if (whitelist.length === 0) {
      return res.status(400).json({ error: "Whitelist is empty" });
    }

    const generator = new MerkleGenerator(whitelist);
    const merkleRoot = generator.getRoot();
    const proofs = generator.getProofs();

    const outputData = {
      merkleRoot,
      airdropData: proofs,
    };

    fs.writeFileSync(merkleTreePath, JSON.stringify(outputData, null, 2));

    res.json({ success: true, merkleRoot, count: whitelist.length });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate Merkle Tree" });
  }
});

export default router;
