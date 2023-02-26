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