import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Mutex } from 'async-mutex';
import { getSettings } from '../utils/settings';

const router = Router();
const whitelistPath = path.join(__dirname, '../../data/whitelist.json');
const mutex = new Mutex();

const readWhitelist = async (): Promise<any[]> => {
  if (!existsSync(whitelistPath)) {
    return [];
  }
  const data = await fs.readFile(whitelistPath, 'utf8');
  return JSON.parse(data);
};

const writeWhitelist = async (data: any[]) => {
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
  
  // Reading doesn't strictly need a lock if we accept eventual consistency,
  // but using one ensures we don't read a partially written file (though writeFile is atomic-ish on POSIX)
  // For high throughput, we might skip the lock for reads or use a ReadWriteLock.
  // For now, simple read is fine without lock or with lock. 
  // Let's use standard async read without lock for speed, assuming atomic writes.
  try {
    const whitelist = await readWhitelist();
    // Case-insensitive check
    const entry = whitelist.find((e: any) => e.address.toLowerCase() === address.toLowerCase());
    
    if (entry) {
      res.json({ isWhitelisted: true, allocation: entry.amount });
    } else {
      res.json({ isWhitelisted: false, allocation: null });
    }
  } catch (error) {
    console.error('Error in /status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
