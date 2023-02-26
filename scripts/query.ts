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

    let contractAddress = process.argv[2];
    if (!contractAddress || contractAddress.length <= 0) {
        contractAddress = "0x284fd3B532b8Ab045047C87b20daefA4ab1B1721";
    }
    const address = ethers.utils.getAddress(contractAddress);
    const ballotContract = new Ballot__factory(signer).attach(address);

    const onChainVoter = await ballotContract.voters(signer.address);
    console.log({ onChainVoter });

    for (let i = 0; i < 10; i++) {
        const proposal = await ballotContract.proposals(i);
        console.log(`Proposal ${i}-----------------`);
        console.log({ proposal });
    }
    console.log("... There were more that 10 proposals!")
}

main().catch((error) => {
    console.log(`------That was all the proposals.`);
    process.exitCode = 1;
});