import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

async function main() {
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
    console.log("------------------");

    let contractAddress = process.argv[2];
    if (!contractAddress || contractAddress.length <= 0) {
        throw new Error("Provide a contract address. Please run 'yarn deploy' first.");
    }
    contractAddress = ethers.utils.getAddress(contractAddress);

    let voterAddress = process.argv[3];
    if (!voterAddress || voterAddress.length <= 0) {
        throw new Error("Provide a voter address.");
    }
    voterAddress = ethers.utils.getAddress(voterAddress);

    const ballotContract = new Ballot__factory(signer).attach(contractAddress);

    const giveVotingRightTxn = await ballotContract.giveRightToVote(voterAddress);
    await giveVotingRightTxn.wait();

    console.log(`Voting right was given to ${voterAddress}.`);
    console.log(`The transaction hash is ${giveVotingRightTxn.hash}.`);
}

main().catch((error) => {
    console.log("------------------");
    console.log(`...That was all the proposals.`);
    process.exitCode = 1;
});