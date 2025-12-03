import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { ethers } from 'ethers';

export interface WhitelistEntry {
  address: string;
  amount: string;
}

export interface MerkleProof {
  address: string;
  amount: string;
  proof: string[];
}

export class MerkleGenerator {
  private tree: MerkleTree;
  private entries: WhitelistEntry[];

  constructor(entries: WhitelistEntry[]) {
    this.entries = entries;
    const leaves = entries.map((entry) => this.encodeLeaf(entry.address, entry.amount));
    this.tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  }

  public getRoot(): string {
    return this.tree.getHexRoot();
  }

  public getProofs(): MerkleProof[] {
    return this.entries.map((entry) => {
      const leaf = this.encodeLeaf(entry.address, entry.amount);
      const proof = this.tree.getHexProof(leaf);
      return {
        address: entry.address,
        amount: entry.amount,
        proof,
      };
    });
  }

  private encodeLeaf(address: string, amount: string): Buffer {
    // Same encoding as Solidity: keccak256(abi.encodePacked(address, amount))
    // Note: ethers.utils.solidityKeccak256 returns a 0x hex string. 
    // We strip the 0x and convert to Buffer for merkletreejs.
    return Buffer.from(
      ethers.utils.solidityKeccak256(['address', 'uint256'], [address, amount]).slice(2),
      'hex'
    );
  }
}
