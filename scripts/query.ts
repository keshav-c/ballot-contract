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
        const contractAddress = process.env.MY_CONTRACT_ADDRESS;
        if (!contractAddress || contractAddress.length <= 0) {
            throw new Error("You haven't yet deployed a contract. Please run 'yarn deploy' first.");
        }
        console.log(`Using contract address ${contractAddress} from .env file`);
    }
    const address = ethers.utils.getAddress(contractAddress);
    const ballotContract = new Ballot__factory(signer).attach(address);

    const onChainVoter = await ballotContract.voters(signer.address);
    console.log(`Voter : ${signer.address}`);
    console.log(`Voted?: ${onChainVoter.voted}`);
    console.log(`Weight: ${onChainVoter.weight}`);
    console.log(`Vote  : ${onChainVoter.vote}`);
    console.log(`Delegated to: ${onChainVoter.delegate}`);
    console.log("------------------");

    console.log("Proposals: ");
    for (let i = 0; i < 10; i++) {
        const proposal = await ballotContract.proposals(i);
        console.log("------------------");
        console.log(`Proposal ${i}`);
        const name = ethers.utils.parseBytes32String(proposal.name);
        console.log(`Name : ${name}`);
        console.log(`Count: ${proposal.voteCount}`);
    }
    console.log("------------------");
    console.log("... There were more that 10 proposals!")
}

main().catch((error) => {
    console.log("------------------");
    console.log(`...That was all the proposals.`);
    process.exitCode = 1;
});