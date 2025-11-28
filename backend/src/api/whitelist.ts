import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Mutex } from 'async-mutex';
import { getSettings } from '../utils/settings';

const router = Router();
const mutex = new Mutex();

const outputDir = process.env.MERKLE_OUTPUT_DIR || 'data';
const resolvedOutputDir = path.isAbsolute(outputDir) 
  ? outputDir 
  : path.join(__dirname, '../../', outputDir);

const whitelistPath = path.join(resolvedOutputDir, 'whitelist.json');
const merkleTreePath = path.join(resolvedOutputDir, 'merkle-tree.json');

const readWhitelist = async (): Promise<any[]> => {
  if (!existsSync(whitelistPath)) {
    return [];
  }
  const data = await fs.readFile(whitelistPath, 'utf8');
  return JSON.parse(data);
};

const writeWhitelist = async (data: any[]) => {
  // Ensure dir exists
  if (!existsSync(resolvedOutputDir)) {
     await fs.mkdir(resolvedOutputDir, { recursive: true });
  }
  await fs.writeFile(whitelistPath, JSON.stringify(data, null, 2));
};

router.post('/join', async (req: Request, res: Response) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  
  // Check System Status
  const settings = await getSettings();
  if (settings.status !== 'COLLECTION') {
      return res.status(403).json({ error: 'Whitelist collection is closed.' });
  }

  // Critical section: Read -> Check -> Write
  // We use a mutex to ensure no other request modifies the file during this process
  const release = await mutex.acquire();

  try {
    const whitelist = await readWhitelist();
    
    if (whitelist.find((entry: any) => entry.address === address)) {
      return res.status(400).json({ error: 'Address already whitelisted' });
    }

    // Mock allocation logic: Random amount between 100 and 1100
    const allocation = (Math.floor(Math.random() * 1000) + 100).toString(); 

    whitelist.push({ address, amount: allocation });
    await writeWhitelist(whitelist);

    res.json({ success: true, allocation });
  } catch (error) {
    console.error('Error in /join:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    release();
  }
});

router.get('/status', async (req: Request, res: Response) => {
  const { address } = req.query;
  
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Address is required' });
  }
  
  try {
    const whitelist = await readWhitelist();
    // Case-insensitive check
    const entry = whitelist.find((e: any) => e.address.toLowerCase() === address.toLowerCase());
    
    if (entry) {
      let proof = undefined;
      // Check for merkle tree if it exists to get the proof
      if (existsSync(merkleTreePath)) {
          const treeData = JSON.parse(await fs.readFile(merkleTreePath, 'utf8'));
          const airdropEntry = treeData.airdropData.find((e: any) => e.address.toLowerCase() === address.toLowerCase());
          if (airdropEntry) {
              proof = airdropEntry.proof;
          }
      }

      res.json({ isWhitelisted: true, allocation: entry.amount, proof });
    } else {
      res.json({ isWhitelisted: false, allocation: null });
    }
  } catch (error) {
    console.error('Error in /status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
