import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const PROPOSALS = ["proposal A", "proposal B", "proposal C"];

function convertToBytes32(proposal: string[]): string[] {
    return proposal.map((p) => ethers.utils.formatBytes32String(p));
}

describe("Ballot", () => {
    let ballotContract: Ballot;

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

        it("sets the voting weight for the chairperson to 1", async function () {
            const signers = await ethers.getSigners();
            const deployerAddress = await signers[0].getAddress();
            const chairperson = await ballotContract.voters(deployerAddress);
            expect(chairperson.weight).to.equal(1);
        });
    });

    describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
        it("gives right to vote for another address", async function () {
            const signers = await ethers.getSigners();
            const chairpersonSigner = signers[0];
            const voter = signers[1];
            const voterAddress = voter.getAddress();
            const transaction = await ballotContract.connect(chairpersonSigner).giveRightToVote(voterAddress);
            await transaction.wait();
            const onChainVoter = await ballotContract.voters(voterAddress);
            expect(onChainVoter.weight).to.equal(1);
        });

        it("can not give right to vote for someone that has voted", async function () {
            const signers = await ethers.getSigners();
            const chairpersonSigner = signers[0];
            const voter = signers[1];
            const voterAddress = voter.getAddress();
            const rightToVoteTxn = await ballotContract.connect(chairpersonSigner).giveRightToVote(voterAddress);
            await rightToVoteTxn.wait();
            const voteTxn = await ballotContract.connect(voter).vote(0);
            await voteTxn.wait();
            await expect(ballotContract
                .connect(chairpersonSigner)
                .giveRightToVote(voterAddress))
                .to.be.revertedWith("The voter already voted.");
        });

        it("can not give right to vote for someone that has already voting rights", async function () {
            const signers = await ethers.getSigners();
            const chairpersonSigner = signers[0];
            const voter = signers[1];
            const voterAddress = voter.getAddress();
            const rightToVoteTxn = await ballotContract.connect(chairpersonSigner).giveRightToVote(voterAddress);
            await rightToVoteTxn.wait();
            await expect(ballotContract
                .connect(chairpersonSigner)
                .giveRightToVote(voterAddress))
                .to.be.reverted;
        })
    });

});
