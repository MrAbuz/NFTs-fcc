const { network } = require("hardhat")

const BASE_FEE = ethers.utils.parseEther("0.25") //should be getting all this values from helper-hardhat-config
const GAS_PRICE_LINK = 1e9

const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("1400", "ether") //same as ethers.utils.parseEther("2000") imo from what I saw in the ethers docs. here you can choose different units other than ether, but did just like patrick

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId == 31337) {
        log("Local network detected! Deploying Mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            //add
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })

        log("-------------Mocks Deployed!--------------")
    }
}

module.exports.tags = ["all", "mocks", "main"]
