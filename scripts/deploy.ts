import { ethers } from "hardhat";

const PROPOSALS = ["Proposal A", "Proposal B", "Proposal C"];

async function main() {
    let proposals = process.argv.slice(2);
    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    if (proposals.length <= 0) {
        proposals = PROPOSALS;
    }
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });
    // TODO
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});