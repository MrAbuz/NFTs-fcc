const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

//Patrick: Ideally, only 1 assert per "it" block
//                  and we check everything

let imageURIsad =
    "PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8c3ZnIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik01MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMCA4MjBjLTIwNS40IDAtMzcyLTE2Ni42LTM3Mi0zNzJzMTY2LjYtMzcyIDM3Mi0zNzIgMzcyIDE2Ni42IDM3MiAzNzItMTY2LjYgMzcyLTM3MiAzNzJ6Ii8+CiAgPHBhdGggZmlsbD0iI0U2RTZFNiIgZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwIDEgOTYgMCA0OC4wMSA0OC4wMSAwIDAgMS05NiAwem0zNzYgMjcyaC00OC4xYy00LjIgMC03LjgtMy4yLTguMS03LjRDNjA0IDYzNi4xIDU2Mi41IDU5NyA1MTIgNTk3cy05Mi4xIDM5LjEtOTUuOCA4OC42Yy0uMyA0LjItMy45IDcuNC04LjEgNy40SDM2MGE4IDggMCAwIDEtOC04LjRjNC40LTg0LjMgNzQuNS0xNTEuNiAxNjAtMTUxLjZzMTU1LjYgNjcuMyAxNjAgMTUxLjZhOCA4IDAgMCAxLTggOC40em0yNC0yMjRhNDguMDEgNDguMDEgMCAwIDEgMC05NiA0OC4wMSA0OC4wMSAwIDAgMSAwIDk2eiIvPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Ii8+Cjwvc3ZnPgo="
//I got this tokenURIsad and tokenURIhappy by inputing the SVGs into "https://base64.guru/converter/encode/image/svg"
let imageURIhappy =
    "PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgIGhlaWdodD0iNDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGcgY2xhc3M9ImV5ZXMiPgogICAgPGNpcmNsZSBjeD0iNjEiIGN5PSI4MiIgcj0iMTIiLz4KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPgogIDwvZz4KICA8cGF0aCBkPSJtMTM2LjgxIDExNi41M2MuNjkgMjYuMTctNjQuMTEgNDItODEuNTItLjczIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGJsYWNrOyBzdHJva2Utd2lkdGg6IDM7Ii8+Cjwvc3ZnPg=="
let sadImageURI = `data:image/svg+xml;base64,${imageURIsad}`
let happyImageURI = `data:image/svg+xml;base64,${imageURIhappy}`

let tokenURIsad = `{"name":"Dynamic SVG NFT", "description":"An NFT whose happiness changes based on the price of ETH", "attributes": [{"trait_type": "coolness", "value": 100}], "image":"${sadImageURI}"}`
let tokenURIhappy = `{"name":"Dynamic SVG NFT", "description":"An NFT whose happiness changes based on the price of ETH", "attributes": [{"trait_type": "coolness", "value": 100}], "image":"${happyImageURI}"}`

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG Unit tests", () => {
          let accounts, deployer, dynamicSvgNft, mockV3Aggregator

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["all"])
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
          })

          describe("Constructor", () => {
              it("Initializes the NFT with the right name", async () => {
                  const name = await dynamicSvgNft.name()
                  assert.equal(name, "Dynamic SVG NFT")
              })
              it("Initializes the NFT with the right ticker", async () => {
                  const ticker = await dynamicSvgNft.symbol()
                  assert.equal(ticker, "DSN")
              })
              it("Initializes the price feed with the right address", async () => {
                  const priceFeed = await dynamicSvgNft.getPriceFeed()
                  assert.equal(priceFeed, mockV3Aggregator.address)
              })
              it("The function svgToImage() produces the right base64 SVG Image URI for the low SVG", async () => {
                  const lowSVG = await dynamicSvgNft.getLowSVG()
                  //assert(lowSVG.includes("data:image/svg+xml;base64,"))
                  //assert(lowSVG.includes(tokenURIsad))
                  assert(lowSVG.includes(sadImageURI))
              })
              it("The function svgToImage() produces the right base64 SVG Image URI for the high SVG", async () => {
                  const highSVG = await dynamicSvgNft.getHighSVG()
                  //assert(highSVG.includes("data:image/svg+xml;base64,"))
                  //assert(highSVG.includes(tokenURIhappy))
                  assert(highSVG.includes(happyImageURI))
              })
          })

          describe("mintNft() function", () => {
              //only test missing is "s_tokenIdToHighValue[tokenId] = highValue" that we'll prove afterwards in tokenURI() test because there's no way to use that mapping directly cuz its private
              it("Updates the token counter with +1 after mintNft() is called", async () => {
                  const tokenCounterBefore = await dynamicSvgNft.getTokenCounter()
                  await dynamicSvgNft.mintNft(1400)
                  const tokenCounterAfter = await dynamicSvgNft.getTokenCounter()
                  assert(tokenCounterBefore < tokenCounterAfter)
                  assert.equal(tokenCounterAfter.toNumber(), tokenCounterBefore.add(1).toNumber())
              })
              it("Mints the nft, proved by emiting the transfer event", async () => {
                  await expect(dynamicSvgNft.mintNft(1400)).to.emit(dynamicSvgNft, "Transfer")
              })
              it("Mints the nft, proved by updating the owners mapping. Also proves the first line of mintNft()", async () => {
                  await dynamicSvgNft.mintNft(1400)
                  const owner = await dynamicSvgNft.ownerOf(0)
                  assert.equal(owner, deployer.address)
              })
              it("Emits the CreatedNFT event", async () => {
                  await expect(dynamicSvgNft.mintNft(1400)).to.emit(dynamicSvgNft, "CreatedNFT")
              })
          })
          describe("_baseURI() function", () => {
              it("tokenURI() returns a string with the prefix from _baseURI() included in the beginning", async () => {
                  await dynamicSvgNft.mintNft(1500)
                  let tokenURI = await dynamicSvgNft.tokenURI(0)
                  assert(tokenURI.includes("data:application/json;base64,"))
              })
          })

          describe("tokenURI() function", () => {
              it("Reverts when called with an invalid tokenId", async () => {
                  await expect(dynamicSvgNft.tokenURI(5)).to.be.revertedWith(
                      "ERC721Metadata__URI_QueryFor_NonExistentToken"
                  )
              })
              //it("The mock was initialized with the right arguments", async () => {
              //    const { ,let price,,, } = await mockV3Aggregator.latestRoundData()
              //})
              //
              //it("the returned tokenURIs are different if price > 1400 or if price is below 1400", async () => {
              //    await dynamicSvgNft.mintNft(1500)
              //    let tokenURI = await dynamicSvgNft.tokenURI(0)
              //    await mockV3Aggregator.updateAnswer(1600)
              //    let tokenURI2 = await dynamicSvgNft.tokenURI(0)
              //    assert(tokenURI != tokenURI2)
              //})
              // updateAnswer()
          })
      })

// Tests missing:

// 1) Need to check line 88 after: mintnft()  "s_tokenIdToHighValue[tokenId] = highValue".
//    Will be able to check it in tokenURI()
