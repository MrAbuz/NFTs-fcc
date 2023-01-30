const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

//Patrick: Ideally, only 1 assert per "it" block
//                  check everything
//                  check the test coverage in the end to make sure its 100%

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
                  let tokenURIzero = await randomIpfsNft.getDogTokenUris("0")
                  assert(tokenURIzero.includes("ipfs://")) // patrick way                                                                         **************
              })
          })

          describe("requestNft", () => {
              it("Reverts if payment isn't sent with the request", async () => {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__WrongAmountETHSent"
                  )
              })

              it("Reverts if payment amount is lower than the mint fee", async () => {
                  const value = ethers.utils.parseEther("0.001")
                  await expect(
                      randomIpfsNft.requestNft({ value: mintFee.sub(value) })
                  ).to.be.revertedWith("RandomIpfsNft__WrongAmountETHSent")
              })

              it("Reverts if payment amount is higher than the mint fee", async () => {
                  const value = ethers.utils.parseEther("0.001")
                  await expect(
                      randomIpfsNft.requestNft({ value: mintFee.add(value) })
                  ).to.be.revertedWith("RandomIpfsNft__WrongAmountETHSent")
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
              it("the vrf coordinator is not exploitable if someone decides to call it directly with the wrong requestId", async function () {
                  await randomIpfsNft.requestNft({ value: mintFee })
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, randomIpfsNft.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(2, randomIpfsNft.address)
                  ).to.be.revertedWith("nonexistent request")
              })
              it("Picks a breed for the dog, updates the token counter, mints the NFT and sets its token URI", async function () {
                  const startingTokenCounter = await randomIpfsNft.getTokenCounter()

                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          console.log("Found the event!")
                          try {
                              const endingTokenCounter = await randomIpfsNft.getTokenCounter()
                              //had to search in the ERC721 functions that we inherited from ERC721.sol and ERC721URIStorage.sol for the next asserts (that we minted and set token URI)
                              const numberOfNfts = await randomIpfsNft.balanceOf(deployer.address)
                              const dogOwner = await randomIpfsNft.ownerOf(startingTokenCounter)
                              const tokenURI = await randomIpfsNft.tokenURI(startingTokenCounter)
                              assert.equal(
                                  endingTokenCounter,
                                  startingTokenCounter.add(1).toString()
                              )
                              assert.equal(numberOfNfts.toString(), 1)
                              assert.equal(dogOwner, deployer.address)
                              assert(tokenURI.includes("ipfs://")) //patrick version
                          } catch (e) {
                              console.log(e)
                              reject()
                          }
                          resolve()
                      })
                      try {
                          const tx = await randomIpfsNft.requestNft({ value: mintFee })
                          const txReceipt = await tx.wait(1)
                          const requestId = txReceipt.events[1].args.requestId
                          //I need to obtain the requestId from the requestNft call because even tho I need to call coordinator.fulfillRandomWords manually, it requires that we insert a requestId that was previously obtained by calling requestRandomWords(). Its how the Chainlink Mock works
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestId,
                              randomIpfsNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
          describe("withdraw", () => {
              it("reverts if it's not the owner withdrawing; and lets the owner withdraw the total amount of ETH in the contract", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          console.log("Found the event!")
                          try {
                              //it reverts if it's not the owner trying to withdraw
                              //this was giving me a lot of problems and the reason was I was trying to .connect(accounts[1]) and we we need to create a variable cuz prob [] inside () assumes its some parentheses
                              const attacker = accounts[1]
                              const ConnectedContract = await randomIpfsNft.connect(attacker)
                              await expect(ConnectedContract.withdraw()).to.be.revertedWith(
                                  "RandomIpfsNft__NotOwner"
                              )

                              //owner can withdraw and withdraws the entire amount of ETH
                              const balanceBeforeWithdraw = await deployer.getBalance()
                              await randomIpfsNft.withdraw()
                              const balanceAfterWithdraw = await deployer.getBalance()
                              assert(balanceAfterWithdraw > balanceBeforeWithdraw)

                              //only thing I couldnt do was this, need to check how to add the gas costs of calling withdraw(), I've done that before
                              //assert.equal(
                              //    balanceAfterWithdraw.toString(),
                              //    balanceBeforeWithdraw.add(mintFee).toString()
                              //)
                          } catch (e) {
                              console.log(e)
                              reject()
                          }
                          resolve()
                      })
                      try {
                          const tx = await randomIpfsNft.requestNft({ value: mintFee })
                          const txReceipt = await tx.wait(1)
                          const requestId = txReceipt.events[1].args.requestId
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestId,
                              randomIpfsNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject()
                      }
                  })
              })
          })
          describe("getBreedFromModdedRng", () => {
              it("If the moddedRng is < 10, it returns a pug (0)", async function () {
                  const pug = await randomIpfsNft.getBreedFromModdedRng(9)
                  assert.equal(pug, 0)
              })
              it("If the moddedRng is >= 10 and < 40, it returns a shiba-inu (1)", async function () {
                  const shibaInu = await randomIpfsNft.getBreedFromModdedRng(10)
                  assert.equal(shibaInu, 1)
              })
              it("If the moddedRng is >= 40 and <= 99, it returns a st. bernard (2)", async function () {
                  const stBernard = await randomIpfsNft.getBreedFromModdedRng(40)
                  assert.equal(stBernard, 2)
              })
              it("It reverts if moddedRng >= 100", async function () {
                  await expect(randomIpfsNft.getBreedFromModdedRng(100)).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
          })
      })
