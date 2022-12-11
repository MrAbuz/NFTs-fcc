const networkConfig = {
    31337: {
        // -----------------------------------------------------------------------------Didn't update none of this. Check this ones
        name: "localhost",
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
        mintFee: "10000000000000000", // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
    },
    5: {
        // Got this values for the chainlink VRF at https://docs.chain.link/vrf/v2/subscription/supported-networks/
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", //---------------------Already updated (https://docs.chain.link/data-feeds/price-feeds/addresses)
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D", //---------------------Already updated
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", //---------------------Already updated (this seems to be the same as Key Hash)
        callbackGasLimit: "2500000", //---------------------Already updated. This is the only one im not sure. If something doesnt work, Patrick had different (he had "500000")
        mintFee: "10000000000000000", //--------------------- Up to me to decide -> 0.01 ETH ?
        subscriptionId: "5122", //---------------------Already updated. (Updated from https://vrf.chain.link/). After deploying we need to add a new consumer in that link
    },
}

const DECIMALS = "18"
const INITIAL_PRICE = "200000000000000000000"
const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
}
