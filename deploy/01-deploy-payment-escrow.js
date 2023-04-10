const { network, ethers } = require("hardhat");
const verify = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { payer, arbiter, beneficiary } = await getNamedAccounts();
    const { deploy, log } = deployments;

    const amount = ethers.utils.parseUnits("100000000000", "wei");

    let testArgs = [arbiter, beneficiary];

    const args =
        network.config.chainId === 80001
            ? [
                  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                  "0x983f6da8bcf9fa1750276a423d6976eadb307e35",
              ]
            : testArgs;

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
    if (network.config.chainId === 80001 && process.env.POLYGONSCAN_API_KEY) {
        await verify(paymentEscrowContract.address, args);
    }
};

module.exports.tags = ["all", "paymentEscrow"];
