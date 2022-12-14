const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages } = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNft"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}
//if we were making a game, typically we'd want this attributes also stored on chain, so that our contracts can programatically interact with this attributes.

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris

    // get the IPFS hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)

        subscriptionId = txReceipt.events[0].args.subId
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("----------------------------------------")

    //const args = [
    //    //add this variables in the same order as the contract
    //    vrfCoordinatorV2Address,
    //    subscriptionId,
    //    networkConfig[chainId].gasLane,
    //    networkConfig[chainId].callbackGasLimit,
    //    // tokenURIs,
    //    networkConfig[chainId].mintFee,
    //]
}

async function handleTokenUris() {
    tokenUris = []
    //store the image in IPFS
    //store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation) //responses renamed to imageUploadResponses. T
    //this responses have the hash of each one of the uploaded images
    for (imageUploadResponseIndex in imageUploadResponses) {
        //this imageUploadResponseIndex way of doing the index is weird, if I say "in" it'll assume the imageUploadResponseIndex to be .length - 1? seems nice!
        //create the metadata
        //upload the metadata
    }

    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"] //yarn hardhat deploy --tags randomipfs,mocks

//Missing: add networkConfig to the helper-hardhat-config require?
//         add process.env.UPLOAD_TO_PINATA
