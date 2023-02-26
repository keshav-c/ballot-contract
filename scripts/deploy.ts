import { ethers } from "ethers";

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
    const wallet = ethers.Wallet.createRandom();
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});