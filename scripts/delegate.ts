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

    let delegateAddress = process.argv[3];
    if (!delegateAddress || delegateAddress.length <= 0) {
        throw new Error("Provide a delegatee address.");
    }
    delegateAddress = ethers.utils.getAddress(delegateAddress);

    const ballotContract = new Ballot__factory(signer).attach(contractAddress);

    const delegateTransaction = await ballotContract.connect(signer).delegate(delegateAddress);
    await delegateTransaction.wait();

    const transactionHash = delegateTransaction.hash;
    console.log(`Delegate was sent to contract. Hash: ${transactionHash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});