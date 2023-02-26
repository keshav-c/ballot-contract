import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const PROPOSALS = ["Proposal A", "Proposal B", "Proposal C"];

function convertToBytes32(proposal: string[]): string[] {
    return proposal.map((p) => ethers.utils.formatBytes32String(p));
}

async function main() {
    let proposals = process.argv.slice(2);
    if (proposals.length <= 0) {
        proposals = PROPOSALS;
    }
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    const provider = ethers.getDefaultProvider("goerli");

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) {
        throw new Error("No private key found");
    }
    console.log("privateKey", privateKey);

    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance} wei`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});