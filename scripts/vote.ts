import { ethers, Wallet } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

async function main() {
    const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        process.env.ALCHEMY_API_KEY
    );
    
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey || privateKey.length <= 0) 
        throw new Error("Missing environment: PRIVATE_KEY");
    
    const wallet = new Wallet(privateKey);
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance()
    console.log(`The account has ${balance} Wei`);

    const args = process.argv;

    const contractAddress = args[2];
    if(!contractAddress || contractAddress.length <= 0) 
        throw new Error("Missing argument: contract addresses");
    
    const vote = args[3];
    if (!vote || vote.length <= 0) throw new Error("Missing argument: vote");
    console.log(`Casting vote for proposal: ${vote}`);

    const ballotContract = new Ballot__factory(signer).attach(contractAddress);
    console.log("Casting vote...");
    const tx = await ballotContract.vote(vote);
    await tx.wait();
    console.log(
        `Your vote has been cast for proposal: ${vote}`
    );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});