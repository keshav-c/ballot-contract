# Ballot Contract Project

This project demonstrates hardhat usage to interact with smart contracts.

Try running some of the following tasks:

```shell
yarn deploy # You can note down the deployed contract address. Use it to update the other scripts in package.json
yarn query # query the signer and the deployed ballot contract
yarn query-cpontrelli # query the ballot contract with the same source deployed by cpontrelli
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