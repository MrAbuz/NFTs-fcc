const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Ipfs NFT Unit Tests", function () {
          let randomIpfsNft, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["all"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft")
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              chainId = network.config.chainId
          })

          describe("Constructor", () => {
              it("Initializes the NFT Correctly.", async () => {
                  const name = await randomIpfsNft.name()
                  const symbol = await randomIpfsNft.symbol()
                  const mintFee = await randomIpfsNft.getMintFee()

                  assert.equal(name, "Random IPFS NFT")
                  assert.equal(symbol, "RIN")
                  assert.equal(mintFee, networkConfig[chainId].mintFee)
              })
              it("Initializes the NFT with the right tokenURIs", async () => {
                  let tokenURIs = await randomIpfsNft.getDogTokenUris("0")
                  assert.equal(!tokenURIs, "")
              })
          })

          describe("fulfillRandomWords", () => {
              beforeEach(async () => {})
              it("", async function () {})
          })
      })
