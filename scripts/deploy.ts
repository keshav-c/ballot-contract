import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
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

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) {
        throw new Error("No private key found");
    }

    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyApiKey || alchemyApiKey.length <= 0) {
        throw new Error("No Alchemy API key found");
    }

    const provider = new ethers.providers.AlchemyProvider("goerli", alchemyApiKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance} wei`);

    // Ballot__factory is picked directly, rather than returned from search
    const ballotContractFactory = new Ballot__factory(signer);
    // check the constructor of the contract
    const convertedProposals = convertToBytes32(proposals);
    console.log("Deploying Ballot contract ...");
    // this sends the transaction to the blockchain
    const ballotContract = await ballotContractFactory.deploy(convertedProposals);
    console.log("Awaiting transaction to be mined ...");
    // this waits for the transaction to be mined
    const transactionReceipt = await ballotContract.deployTransaction.wait();
    const contractAddress = transactionReceipt.contractAddress;
    const blockNumber = transactionReceipt.blockNumber;
    console.log(`Ballot contract deployed at ${contractAddress} and block number ${blockNumber}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});