import fs from 'fs';
import path from 'path';
import { MerkleGenerator, WhitelistEntry } from '../src/utils/merkle';

const whitelistPath = path.join(__dirname, '../data/whitelist.json');
const outputPath = path.join(__dirname, 'merkle-tree.json');

const generate = () => {
  if (!fs.existsSync(whitelistPath)) {
    console.error('Whitelist file not found:', whitelistPath);
    process.exit(1);
  }

  const whitelist: WhitelistEntry[] = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
  const generator = new MerkleGenerator(whitelist);

  const merkleRoot = generator.getRoot();
  const proofs = generator.getProofs();

  const outputData = {
    merkleRoot,
    airdropData: proofs
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log('Merkle Tree generated successfully.');
  console.log('Root:', merkleRoot);
  console.log('Output:', outputPath);
};

generate();
