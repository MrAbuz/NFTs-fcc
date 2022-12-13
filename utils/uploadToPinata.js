//this is where we'll add our code to upload to Pinata
//Pinata is a centralized service that we're gonna use to pin the data for us.

//we also installed a "path" package to help us work with paths. basically to point a path like "images/randomNFT"
//yarn add --dev path

const pinataSDK = require("@pinata/sdk") //yarn add --dev @pinata/sdk
const path = require("path")
const fs = require("fs")

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath) //to help us work with paths
    const files = fs.readdirSync(fullImagesPath) //to read the files in here. To read the entire directory and get our "files"
    console.log(files)
}

module.exports = { storeImages }
