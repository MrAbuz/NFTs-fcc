const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
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

let tokenUris = [
    "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
    "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
    "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
]
//in the beginning we just had "let tokenUris", but once we deployed and we got this tokenUris array in the console.log, we went to .env and switched UPLOAD_TO_PINATA
//to false, and we copied and hardcoded the tokenUris array we generated (and printed in the console.log) to the "let tokenUris"
//and we had this "let tokenUris" inside module.exports and we took it out to here after we hardcoded it, dunno if it changes anything if in the future I repeat this process
//starting with tokenUris outside of module.exports, but i'll keep it registed. Imo it's the same. He assumes variables we're hardcoding are better ouside, interesting

const FUND_AMOUNT = "1000000000000000000000" //he says this is 10 LINK, but isnt it 1000 LINK?

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // get the IPFS hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)

        subscriptionId = txReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("----------------------------------------")

    const args = [
        //add this variables in the same order as the contract
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    //adding the contract as a consumer after deploying
    if (chainId == 31337) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
    }

    log("----------------------------------------")

    //verify
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNft.address, args)
    }
}

async function handleTokenUris() {
    tokenUris = []
    //store the image in IPFS;
    //store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation) //responses renamed to imageUploadResponses. T
    //this "responses" have the ipfshash (cid) of each one of the uploaded images (and also the Pinsize and the Timestamp)
    for (imageUploadResponseIndex in imageUploadResponses) {
        //this imageUploadResponseIndex way of doing the index is weird, if I say "in" it'll assume the imageUploadResponseIndex to be .length - 1? seems nice!
        let tokenUriMetadata = { ...metadataTemplate } //this is some fun javascript syntactic sugar which kinda means unpack.
        //Basically we're saying tokenUriMetadata is gonna be equal to the template we created above
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "") //basicaly files are pug.png, st-bernard.png, shiba-inu.png, we're removing the ".png" off
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}` //because each response we get either the IpfsHash, PinSize or TimeStamp. We just care about the IpfsHash
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        //store the JSON to Pinata / IPFS
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`) //because remember that this responses bring the IpfsHash, then PinSize and the TimeStamp, but we just using IpfsHash
    }
    console.log("Token URIs Uploaded! They are:")
    console.log(tokenUris)
    return tokenUris

    // ******REMEMBER******:
    // 2 things:
    // 1) In the end when we deploy we must copy the CIDs (the hashes after ipfs://) of the TokenURIs and the CIDs of the images (that are inside the tokenURIs)
    //and pin them in our local IPFS node. This CIDs either appear in the console.log after deploying (and the image one inside each TokenURI); or in the Pinata site,
    //they upload after we deploy and refresh it. We need to do this so that we also have them pinned in our local node and we're not dependent on Pinata exclusively.
    // 2) Before the deploy we just had "let tokenUris", but once we deployed and we got this tokenUris array in the console.log, we went to .env and switched UPLOAD_TO_PINATA
    //to false, and we copied and hardcoded the tokenUris array we generated from the console.log to the "let tokenUris".
}

module.exports.tags = ["all", "randomipfs", "main"] //yarn hardhat deploy --tags randomipfs,mocks
