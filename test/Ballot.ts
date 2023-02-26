import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const PROPOSALS = ["proposal A", "proposal B", "proposal C"];

function convertToBytes32(proposal: string[]): string[] {
    return proposal.map((p) => ethers.utils.formatBytes32String(p));
}

function convertToString(proposal: string[]): string[] {
    return proposal.map((p) => ethers.utils.parseBytes32String(p));
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

    describe("when the voter interact with the vote function in the contract", function () {
        it("should register the vote", async () => {
            const signers = await ethers.getSigners();
            const voter = signers[1];
            const rightToVoteTxn = await ballotContract.giveRightToVote(voter.address);
            await rightToVoteTxn.wait();
            const voteTxn = await ballotContract.connect(voter).vote(1);
            await voteTxn.wait();
            const proposal = await ballotContract.proposals(1);
            expect(proposal.voteCount).to.equal(1);
        });
    });

    describe("when the voter interact with the delegate function in the contract", function () {
        it("should transfer voting power", async () => {
            const signers = await ethers.getSigners();
            const voter = signers[1];
            const delegate = signers[2];
            let rightToVoteTxn = await ballotContract.giveRightToVote(voter.address); //not clear why giveRightToVote is used here. Only Chair person can call this function
            await rightToVoteTxn.wait();
            rightToVoteTxn = await ballotContract.giveRightToVote(delegate.address);
            await rightToVoteTxn.wait();
            const delegateTxn = await ballotContract.connect(voter).delegate(delegate.address);
            await delegateTxn.wait();
            const delegateVoter = await ballotContract.voters(delegate.address);
            expect(delegateVoter.weight).to.equal(2);
            const onChainVoter = await ballotContract.voters(voter.address);
            expect(onChainVoter.voted).to.be.true;
            expect(onChainVoter.delegate).to.equal(delegate.address);
        });
    });

    describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
        it("should revert", async () => {
            const signers = await ethers.getSigners();
            const attacker = signers[1];
            await expect(ballotContract
                .connect(attacker)
                .giveRightToVote(attacker.address))
                .to.be.revertedWith("Only chairperson can give right to vote.");
        });
    });

    describe("when the an attacker interact with the vote function in the contract", function () {
        it("should revert", async () => {
            const signers = await ethers.getSigners();
            const attacker = signers[1];
            await expect(ballotContract
                .connect(attacker)
                .vote(1))
                .to.be.revertedWith("Has no right to vote");
        });
    });

    describe("when the an attacker interact with the delegate function in the contract", function () {
        it("should revert if trying to delegate to itself", async () => {
            const signers = await ethers.getSigners();
            const attacker = signers[1];
            const rightToVoteTxn = await ballotContract.giveRightToVote(attacker.address);
            await rightToVoteTxn.wait();
            await expect(ballotContract
                .connect(attacker)
                .delegate(attacker.address))
                .to.be.revertedWith("Self-delegation is disallowed.");
        });

        it("should revert if attacker has already voted", async () => {
            const signers = await ethers.getSigners();
            const attacker = signers[1];
            const rightToVoteTxn = await ballotContract.giveRightToVote(attacker.address);
            await rightToVoteTxn.wait();
            const voteTxn = await ballotContract.connect(attacker).vote(1);
            await voteTxn.wait();
            const proxy = signers[2];
            await expect(ballotContract
                .connect(attacker)
                .delegate(proxy.address))
                .to.be.revertedWith("You already voted.");
        });

        it("should revert if attacker cannot vote", async () => {
            const signers = await ethers.getSigners();
            const attacker = signers[1];
            const proxy = signers[2];
            await expect(ballotContract
                .connect(attacker)
                .delegate(proxy.address))
                .to.be.revertedWith("You have no right to vote");
        });
    });

    describe("when someone interact with the winningProposal function before any votes are cast", function () {
        it("should return 0", async () => {
            const winningProposal = await ballotContract.winningProposal();
            expect(winningProposal).to.equal(0);
        });
    });

    describe("when someone interact with the winningProposal function after one vote is cast for the second proposal", function () {
        it("should return 1", async () => {
            const signers = await ethers.getSigners();
            const voter = signers[1];
            const rightToVoteTxn = await ballotContract.giveRightToVote(voter.address);
            await rightToVoteTxn.wait();
            const voteTxn = await ballotContract.connect(voter).vote(1);
            await voteTxn.wait();
            const winningProposal = await ballotContract.winningProposal();
            expect(winningProposal).to.equal(1);
        });
    });

    describe("when someone interact with the winnerName function before any votes are cast", function () {
        it("should return name of proposal 0", async () => {
            const winnerName = await ballotContract.winnerName();
            const proposalName = ethers.utils.parseBytes32String(winnerName);
            expect(proposalName).to.equal("proposal A");
        });
    });

    describe("when someone interact with the winnerName function after one vote is cast for the second proposal", function () {
        it("should return name of proposal 0", async () => {
            const signers = await ethers.getSigners();
            const voter = signers[1];
            const rightToVoteTxn = await ballotContract.giveRightToVote(voter.address);
            await rightToVoteTxn.wait();
            const voteTxn = await ballotContract.connect(voter).vote(1);
            await voteTxn.wait();
            const winnerName = await ballotContract.winnerName();
            const proposalName = ethers.utils.parseBytes32String(winnerName);
            expect(proposalName).to.equal("proposal B");
        });
    });

    describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
        it("should return the name of the winner proposal", async () => {
            const winningProposalId = await cast5andomVotes(ballotContract);
            const winningProposal = await ballotContract.winningProposal();
            expect(winningProposal).to.equal(winningProposalId);
            const winnerName = await ballotContract.winnerName();
            const proposalName = ethers.utils.parseBytes32String(winnerName);
            expect(proposalName).to.equal(PROPOSALS[winningProposalId]);
        });
    });
});

async function cast5andomVotes(ballotContract: Ballot): Promise<number> {
    const signers = await ethers.getSigners();
    const votes = [0, 0, 0];
    for (let i = 1; i <= 5; i++) {
        const voter = signers[i];
        const rightToVoteTxn = await ballotContract.giveRightToVote(voter.address);
        await rightToVoteTxn.wait();
        const proposalId = Math.floor(Math.random() * 3);
        const voteTxn = await ballotContract.connect(voter).vote(proposalId);
        await voteTxn.wait();
        votes[proposalId]++;
    }
    return votes.indexOf(Math.max(...votes));
}
