import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";


describe("Ballot", () => {
    let ballotContract: Ballot;
    const PROPOSALS = ["proposal A", "proposal B", "proposal C"];
    function convertToBytes32(proposal: string[]): string[] {
        return proposal.map((p) => ethers.utils.formatBytes32String(p));
    }
    beforeEach(async () => {
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        const convertedProposals = convertToBytes32(PROPOSALS);
        ballotContract = await ballotContractFactory.deploy(convertedProposals);
        const transactionReceipt = await ballotContract.deployTransaction.wait();
    });
    describe("when the contract is deployed", () => {
        it("has the the provided proposals", async function () {
            for (let i = 0; i < PROPOSALS.length; i++) {
                const proposal = await ballotContract.proposals(i);
                const name = ethers.utils.parseBytes32String(proposal.name);
                expect(name).to.equal(PROPOSALS[i]);
            }
        });
        it("sets the deployer address as the chairperson", async function () {
            const signers = await ethers.getSigners();
            const deployerAddress = await signers[0].getAddress();
            const chairperson = await ballotContract.chairperson();
            expect(chairperson).to.equal(deployerAddress);
        });
        it("has zero votes for all proposals", async function () {
            for (let i = 0; i < PROPOSALS.length; i++) {
                const proposal = await ballotContract.proposals(i);
                expect(proposal.voteCount).to.equal(0);
            }
        });
        it("sets the voting weight for the chairperson to 1", async function () { });
    })
})

// parse and print the deployed proposals
// debug and see the proposal values