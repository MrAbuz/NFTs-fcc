const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

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
    //store the image in IPFS;
    //store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation) //responses renamed to imageUploadResponses. T
    //this "responses" have the ipfshash of each one of the uploaded images (and the Pinsize and the Timestamp)
    for (imageUploadResponseIndex in imageUploadResponses) {
        //this imageUploadResponseIndex way of doing the index is weird, if I say "in" it'll assume the imageUploadResponseIndex to be .length - 1? seems nice!
        let tokenUriMetadata = { ...metadataTemplate } //this is some fun javascript syntactic sugar which kinda means unpack.
        //Basically we're saying tokenUriMetadata is gonna be equal to the template we created above
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "") //basicaly files is gonna be pug.png, st-bernard.png, shiba-inu.png, we're removing the ".png" off
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}` //because each response we get have either the IpfsHash, PinSize or TimeStamp. We just care about the IpfsHash
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        //store the JSON to Pinata / IPFS
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`) //because remember that this responses bring the IpfsHash, then PinSize and the TimeStamp, but we just using IpfsHash
    }
    console.log("Token URIs Uploaded! They are:")
    console.log(tokenUris)
    return tokenUris

    //******REMEMBER******: In the end when we deploy we must copy the CIDs (the hashes after ipfs://) of the TokenURIs and the CIDs of the images (that are inside the tokenURIs) and
    //pin them in our local IPFS node. This CIDs either appear in the console.log after deploying (and the image one inside each TokenURI); or in the Pinata site, they upload after
    //we deploy and refresh it.
}

module.exports.tags = ["all", "randomipfs", "main"] //yarn hardhat deploy --tags randomipfs,mocks

//Missing: add networkConfig to the helper-hardhat-config require?
//         add process.env.UPLOAD_TO_PINATA

//21:57:00
