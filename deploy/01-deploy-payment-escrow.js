const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { payer, arbiter, beneficiary } = await getNamedAccounts();
    const { deploy, log } = deployments;

    const amount = ethers.utils.parseEther("1");

    const args = [arbiter, beneficiary];

    const paymentEscrowContract = await deploy("PaymentEscrow", {
        from: payer,
        log: true,
        args,
        waitConfirmations: network.config.blockConfirmation || 1,
        value: amount,
    });

    log("Contract deployed");
    log("-------------------------");

    // verify
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await verify(paymentEscrowContract.address, args);
    }
};

module.exports.tags = ["all", "paymentEscrow"];
