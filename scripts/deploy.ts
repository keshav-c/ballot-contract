import { ethers } from "hardhat";

const PROPOSALS = ["Proposal A", "Proposal B", "Proposal C"];

async function main() {
    const args = process.argv;
    console.log("Arguments: ", args);
    return;
    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    PROPOSALS.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });
    // TODO
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});