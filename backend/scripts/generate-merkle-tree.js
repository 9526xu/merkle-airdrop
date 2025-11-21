const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { utils } = require('ethers');
const fs = require('fs');
const path = require('path');

// 1. Read whitelist
const whitelistPath = path.join(__dirname, 'whitelist.json');
const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

// 2. Create leaf nodes
const leafNodes = whitelist.map(item => {
  return Buffer.from(
    utils.solidityKeccak256(['address', 'uint256'], [item.address, item.amount]).slice(2),
    'hex'
  );
});

// 3. Create Merkle tree
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

// 4. Get Merkle root
const merkleRoot = merkleTree.getHexRoot();

console.log('Merkle Root:', merkleRoot);

// 5. Generate proofs and create final data structure
const airdropData = whitelist.map((item, index) => {
  const proof = merkleTree.getHexProof(leafNodes[index]);
  return {
    ...item,
    proof,
  };
});

// 6. Write to file
const outputPath = path.join(__dirname, 'merkle-tree.json');
const outputData = {
  merkleRoot: merkleRoot,
  airdropData: airdropData
};
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

console.log(`Merkle tree data written to ${outputPath}`);
