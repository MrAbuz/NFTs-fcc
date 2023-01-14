const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

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
          })
      })
