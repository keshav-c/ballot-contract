# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
## Notes

**The proposals array public contract member:**
- It is impossible to get the entire array from the contract storage at once
- We can only search elements one by one
- If we go out of bounds when accessing members on the deployed contract, we get an error

**Running a script**
- When running without arguments
    ```shell
    yarn hardhat run path-to-script.ts
    ```

- But if we want to pass arguments to the script
    ```shell
    yarn run ts-node --files path-to-script.ts ...arguments
    ```

**On running**
- Run `yarn install` when you change folder name and update package.json
- Changes to the local blockchain are persistent? The first signer which deployed the ballot contract has a slightly reduced balance...
    - No! it would be reduced if we check balance after deploying. 😏

**Printing Stuff**
- Enclose objects in `{}` to avoid `[object Object]` console logs

**Using the real test network**
- In order to break out of localhost, we use the `ethers` from _ethers.js_ library (v5)
- `ethers.getContractFactory` is no longer available, instead use the Contract Factory in typechain
- Alchemy UI shows the details of all the recent requests on the chain.

## Deployments
 
- Ballot contract deployed at 0x284fd3B532b8Ab045047C87b20daefA4ab1B1721 and block number 8558261
- Once deployed we don't need to deploy the same contract again. Instead we use the `contractFactory.attach(address)` function to interact with the deployed contract.