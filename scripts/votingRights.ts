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
    
    const voterAddresses = args.slice(3)
    if (voterAddresses.length <= 0) throw new Error("Missing argument: voter addresses");
    console.log("Granting voting rights to addresses");
    console.log("Addresses: ");
    voterAddresses.forEach((element, index) => {
        console.log(`Address N. ${index + 1}: ${element}`);
    });
    
    const ballotContract = new Ballot__factory(signer).attach(contractAddress);
    const chairperson = await ballotContract.chairperson();
    if (chairperson != signer.address) throw new Error("Only the chairperson can grant voting rights");

    console.log("Granting voting rights...");
    voterAddresses.forEach( async(address) => {
        const tx = await ballotContract.giveRightToVote(address);
        await tx.wait();
        console.log(
            `Voting rights have been granted to ${address}`
        );
    });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});