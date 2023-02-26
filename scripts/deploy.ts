import { ethers } from "hardhat";

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
    console.log("Deploying Ballot contract ...");
    const ballotContractFactory = await ethers.getContractFactory("Ballot");
    // check the constructor of the contract
    const convertedProposals = convertToBytes32(proposals);
    // this sends the transaction to the blockchain
    const ballotContract = await ballotContractFactory.deploy(convertedProposals);
    // this waits for the transaction to be mined
    const transactionReceipt = await ballotContract.deployTransaction.wait();
    const contractAddress = transactionReceipt.contractAddress;
    const blockNumber = transactionReceipt.blockNumber;
    console.log(`Ballot contract deployed at ${contractAddress} and block number ${blockNumber}`);

    const signers = await ethers.getSigners();
    const signer = signers[0];
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance}`);

    const provider = ethers.provider;
    console.log(provider);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});