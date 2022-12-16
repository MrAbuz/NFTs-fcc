const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Ipfs NFT Unit Tests", () => {
          let accounts, deployer, randomIpfsNft, vrfCoordinatorV2Mock, mintFee
          const chainId = network.config.chainId

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["all"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              mintFee = await randomIpfsNft.getMintFee()
          })

          describe("Constructor", () => {
              it("Initializes the NFT Correctly.", async () => {
                  const name = await randomIpfsNft.name()
                  const symbol = await randomIpfsNft.symbol()
                  assert.equal(name, "Random IPFS NFT")
                  assert.equal(symbol, "RIN")
                  assert.equal(mintFee, networkConfig[chainId].mintFee)
              })
              it("Initializes the NFT with the right tokenURIs", async () => {
                  let tokenURIs = await randomIpfsNft.getDogTokenUris("0")
                  assert.equal(!tokenURIs, "")
              })
          })

          describe("requestNft", () => {
              it("Reverts if the payment is below the mint fee", async () => {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })

              it("Calls the requestRandomWords function properly", async () => {
                  const tx = await randomIpfsNft.requestNft({ value: mintFee })
                  const txReceipt = await tx.wait(1)
                  const requestId = txReceipt.events[1].args.requestId //weird that this didnt work with events[0] even tho requestRandomWords() also emits and event with
                  //an arg of requestId. the mock isnt emiting an event? but at the same time it is because our event is event[1]
                  assert(requestId.toNumber() > 0)
              })

              it("updates the s_requestIdToSender mapping of requestId to addresses", async () => {
                  const tx = await randomIpfsNft.requestNft({ value: mintFee })
                  const txReceipt = await tx.wait(1)
                  const requestId = txReceipt.events[1].args.requestId

                  const sender = await randomIpfsNft.s_requestIdToSender(requestId)
                  assert.equal(sender, deployer.address)
              })

              it("emits the event when we request an nft", async () => {
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })

          describe("fulfillRandomWords", () => {
              beforeEach(async () => {
                  const { requestId } = await randomIpfsNft.requestNft({ value: mintFee })
              })
              it("", async function () {})
          })
      })

//token counter is a get, good to know when/if we mint
//mapping requestId => addresses public
