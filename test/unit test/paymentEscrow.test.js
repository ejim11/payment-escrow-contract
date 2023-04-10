const { deployments, network, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("Payment-Escrow", function () {
    let payer, paymentEscrowContract, arbiter, beneficiary;

    beforeEach(async function () {
        payer = (await getNamedAccounts()).payer;

        await deployments.fixture(["all"]);

        paymentEscrowContract = await ethers.getContract(
            "PaymentEscrow",
            payer
        );

        arbiter = (await getNamedAccounts()).arbiter;

        beneficiary = (await getNamedAccounts()).beneficiary;
    });

    describe("constructor", function () {
        it("should transfer a value of 1ether to the contract after deployment", async function () {
            const presentContractBalance = await ethers.provider.getBalance(
                paymentEscrowContract.address
            );

            assert.equal(presentContractBalance.toString() / 1e18, "1");
        });

        it("should set an arbiter and a beneficiary after deployment", async function () {
            const _arbiter = await paymentEscrowContract.s_arbiter.call();

            const _beneficiary =
                await paymentEscrowContract.s_beneficiary.call();

            assert.equal(arbiter, _arbiter);
            assert.equal(beneficiary, _beneficiary);
        });
    });

    describe("approve", function () {
        it("should revert when it is not called by the arbiter", async function () {
            await expect(
                paymentEscrowContract
                    .connect(await ethers.getSigner(4))
                    .approve()
            ).to.be.reverted;
        });

        it("should not revert if called by the arbiter", async function () {
            await expect(
                paymentEscrowContract
                    .connect(await ethers.getSigner(1))
                    .approve()
            ).not.to.be.reverted;
        });

        it("should transfer the payment to the beneficiary", async function () {
            const beneficiaryStartingBalance = await ethers.provider.getBalance(
                beneficiary
            );

            const contractBalance = await ethers.provider.getBalance(
                paymentEscrowContract.address
            );

            const payedAmount = contractBalance - (contractBalance / 1000) * 5;

            const _arbiter = await ethers.getSigner(1);

            await paymentEscrowContract.connect(_arbiter).approve();

            const beneficiaryEndingBalance = await ethers.provider.getBalance(
                beneficiary
            );

            const contractBalanceAfter = await ethers.provider.getBalance(
                paymentEscrowContract.address
            );

            assert.equal(
                payedAmount.toString(),
                beneficiaryEndingBalance
                    .sub(beneficiaryStartingBalance)
                    .toString()
            );

            assert.equal(contractBalanceAfter.toString(), "0");
        });

        it("should pay a fee of 0.5% the payed amount to the arbiter", async function () {
            const startingArbiterBalance = await ethers.provider.getBalance(
                arbiter
            );

            const contractBalance = await ethers.provider.getBalance(
                paymentEscrowContract.address
            );

            const fee = (contractBalance / 1000) * 5;

            const _arbiter = await ethers.getSigner(1);

            const transactionResponse = await paymentEscrowContract
                .connect(_arbiter)
                .approve();

            const transactionReceipt = await transactionResponse.wait();

            const { gasUsed, effectiveGasPrice } = transactionReceipt;

            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingArbiterBalance = await ethers.provider.getBalance(
                arbiter
            );

            assert.equal(
                fee.toString(),
                endingArbiterBalance
                    .sub(startingArbiterBalance)
                    .add(gasCost)
                    .toString()
            );
        });

        it("should emit an event after approval", async function () {
            const contractBalance = await ethers.provider.getBalance(
                paymentEscrowContract.address
            );

            const payedAmount = contractBalance - (contractBalance / 1000) * 5;

            const _arbiter = await ethers.getSigner(1);
            expect(
                await paymentEscrowContract.connect(_arbiter).approve()
            ).to.emit(payer, beneficiary, payedAmount);
            assert(await paymentEscrowContract.s_isApproved.call());
        });
    });
});
