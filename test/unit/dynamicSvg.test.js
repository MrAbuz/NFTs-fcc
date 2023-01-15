const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

//Patrick: Ideally, only 1 assert per "it" block
//                  and we check everything

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
                  //                                                                                                                                       finish this
                  const lowSVG = await dynamicSvgNft.getLowSVG()
                  assert(lowSVG.includes("data:image/svg+xml;base64,"))
              })
              it("The function svgToImage() produces the right base64 SVG Image URI for the high SVG", async () => {
                  //                                                                                                                                       finish this
                  const highSVG = await dynamicSvgNft.getHighSVG()
                  assert(highSVG.includes("data:image/svg+xml;base64,"))
              })
          })

          describe("mintNft() function", () => {
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
              it("Mints the nft, proved by updating the owners mapping", async () => {
                  await dynamicSvgNft.mintNft(1400)
                  const owner = await dynamicSvgNft.ownerOf(0)
                  assert.equal(owner, deployer.address)
              })
              it("Emits the CreatedNFT event", async () => {
                  await expect(dynamicSvgNft.mintNft(1400)).to.emit(dynamicSvgNft, "CreatedNFT")
              })
          })
      })

//await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
//    raffle,
//    "RaffleEnter"
// )

//need to check line 88 after: mintnft()  "s_tokenIdToHighValue[tokenId] = highValue".
//will be able to check it in tokenURI()
