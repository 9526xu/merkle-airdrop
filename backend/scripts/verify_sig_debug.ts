
import { ethers } from "ethers";

const domain = {
    name: 'Airdrop',
    version: '1',
    chainId: 31337,
    verifyingContract: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
};

const types = {
    Claim: [
        { name: 'claimer', type: 'address' },
        { name: 'amount', type: 'uint256' }
    ]
};

const value = {
    claimer: '0xDbAb90d3A468E25ed69F54D0850d492F3C6649BD',
    amount: "115" 
};

const signature = "0x666edbdf48d9d55638bc778a4f9310f174cf9ab83ac8a3cbcb7d65aab03d8e410582f33874a7197a50e2be3118b3e6aacbeb3427ff48fdffa7be52e42a709ee21b";

async function verify() {
    const recoveredAddress = ethers.utils.verifyTypedData(domain, types, value, signature);
    
    console.log("Recovered Address:", recoveredAddress);
    console.log("Expected Address: ", value.claimer);
    
    if (recoveredAddress.toLowerCase() === value.claimer.toLowerCase()) {
        console.log("✅ Signature Matches!");
    } else {
        console.log("❌ Signature Mismatch!");
    }
}

verify().catch(console.error);
