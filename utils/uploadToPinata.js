//Pinata is a centralized service that we're gonna use to either pin the data for us, and upload to IPFS.
//Now we'll store the nft data both in our IPFS node and in Pinata's node, so that if our computer/server goes down we have atleast somebody else pinning it.
//We could also use nft.storage which is the decentralized version (patrick showed us the code), check excel

const pinataSDK = require("@pinata/sdk") //yarn add --dev @pinata/sdk. had to install an earlier version, check excel
const path = require("path") //we also installed a "path" package to help us work with paths. basically to point a path like "images/randomNFT". yarn add --dev path
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath) //to help us work with paths
    const files = fs.readdirSync(fullImagesPath) //to read the files in here. To read the entire directory and get our "files". The console.log of this was an array I think: [ , , ]. So we picked files in the directory and grouped them in an array
    let responses = [] //responses from the Pinata server

    console.log("Uploading to Pinata!")
    for (fileIndex in files) {
        console.log(`Working on ${fileIndex}...`)
        //we're creating a read stream: since this is an image file it doesnt work exactly the same as just pushing the data, we have to create a stream where we stream all the data.
        //because this images are actually a big file with all the bytes and data in it
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response) //we push the response into our responses array
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }
