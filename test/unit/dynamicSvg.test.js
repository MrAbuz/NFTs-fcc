const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

//Patrick: Ideally, only 1 assert per "it" block
//                  check everything
//                  check the test coverage in the end to make sure its 100%

let imageURIsad =
    "PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8c3ZnIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik01MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMCA4MjBjLTIwNS40IDAtMzcyLTE2Ni42LTM3Mi0zNzJzMTY2LjYtMzcyIDM3Mi0zNzIgMzcyIDE2Ni42IDM3MiAzNzItMTY2LjYgMzcyLTM3MiAzNzJ6Ii8+CiAgPHBhdGggZmlsbD0iI0U2RTZFNiIgZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwIDEgOTYgMCA0OC4wMSA0OC4wMSAwIDAgMS05NiAwem0zNzYgMjcyaC00OC4xYy00LjIgMC03LjgtMy4yLTguMS03LjRDNjA0IDYzNi4xIDU2Mi41IDU5NyA1MTIgNTk3cy05Mi4xIDM5LjEtOTUuOCA4OC42Yy0uMyA0LjItMy45IDcuNC04LjEgNy40SDM2MGE4IDggMCAwIDEtOC04LjRjNC40LTg0LjMgNzQuNS0xNTEuNiAxNjAtMTUxLjZzMTU1LjYgNjcuMyAxNjAgMTUxLjZhOCA4IDAgMCAxLTggOC40em0yNC0yMjRhNDguMDEgNDguMDEgMCAwIDEgMC05NiA0OC4wMSA0OC4wMSAwIDAgMSAwIDk2eiIvPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Ii8+Cjwvc3ZnPgo="
//I got this tokenURIsad and tokenURIhappy by inputing the SVGs into "https://base64.guru/converter/encode/image/svg"
let imageURIhappy =
    "PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgIGhlaWdodD0iNDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGcgY2xhc3M9ImV5ZXMiPgogICAgPGNpcmNsZSBjeD0iNjEiIGN5PSI4MiIgcj0iMTIiLz4KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPgogIDwvZz4KICA8cGF0aCBkPSJtMTM2LjgxIDExNi41M2MuNjkgMjYuMTctNjQuMTEgNDItODEuNTItLjczIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGJsYWNrOyBzdHJva2Utd2lkdGg6IDM7Ii8+Cjwvc3ZnPg=="
let sadImageURI = `data:image/svg+xml;base64,${imageURIsad}`
let happyImageURI = `data:image/svg+xml;base64,${imageURIhappy}`

let tokenJsonsad = `{"name":"Dynamic SVG NFT", "description":"An NFT whose happiness changes based on the price of ETH", "attributes": [{"trait_type": "coolness", "value": 100}], "image":"${sadImageURI}"}`
let tokenJsonhappy = `{"name":"Dynamic SVG NFT", "description":"An NFT whose happiness changes based on the price of ETH", "attributes": [{"trait_type": "coolness", "value": 100}], "image":"${happyImageURI}"}`

//Now I made the JSON full written so I can just copy to "https://base64.guru/converter/encode/image/svg" and get the base 64 encoded version of the json
let tokenJsonToCopyHappy = `{"name":"Dynamic SVG NFT", "description":"An NFT whose happiness changes based on the price of ETH", "attributes": [{"trait_type": "coolness", "value": 100}], "image":"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgIGhlaWdodD0iNDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGcgY2xhc3M9ImV5ZXMiPgogICAgPGNpcmNsZSBjeD0iNjEiIGN5PSI4MiIgcj0iMTIiLz4KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPgogIDwvZz4KICA8cGF0aCBkPSJtMTM2LjgxIDExNi41M2MuNjkgMjYuMTctNjQuMTEgNDItODEuNTItLjczIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGJsYWNrOyBzdHJva2Utd2lkdGg6IDM7Ii8+Cjwvc3ZnPg=="}`
let tokenJsonToCopySad = `{"name":"Dynamic SVG NFT", "description":"An NFT whose happiness changes based on the price of ETH", "attributes": [{"trait_type": "coolness", "value": 100}], "image":"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8c3ZnIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik01MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMCA4MjBjLTIwNS40IDAtMzcyLTE2Ni42LTM3Mi0zNzJzMTY2LjYtMzcyIDM3Mi0zNzIgMzcyIDE2Ni42IDM3MiAzNzItMTY2LjYgMzcyLTM3MiAzNzJ6Ii8+CiAgPHBhdGggZmlsbD0iI0U2RTZFNiIgZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwIDEgOTYgMCA0OC4wMSA0OC4wMSAwIDAgMS05NiAwem0zNzYgMjcyaC00OC4xYy00LjIgMC03LjgtMy4yLTguMS03LjRDNjA0IDYzNi4xIDU2Mi41IDU5NyA1MTIgNTk3cy05Mi4xIDM5LjEtOTUuOCA4OC42Yy0uMyA0LjItMy45IDcuNC04LjEgNy40SDM2MGE4IDggMCAwIDEtOC04LjRjNC40LTg0LjMgNzQuNS0xNTEuNiAxNjAtMTUxLjZzMTU1LjYgNjcuMyAxNjAgMTUxLjZhOCA4IDAgMCAxLTggOC40em0yNC0yMjRhNDguMDEgNDguMDEgMCAwIDEgMC05NiA0OC4wMSA0OC4wMSAwIDAgMSAwIDk2eiIvPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Ii8+Cjwvc3ZnPgo="}`

//added the "data:application/json;base64," to the base64 encoded version of the json that the site provided. I'll compare this to the results given by tokenURI()
let tokenFinalURIHappy = `data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiQW4gTkZUIHdob3NlIGhhcHBpbmVzcyBjaGFuZ2VzIGJhc2VkIG9uIHRoZSBwcmljZSBvZiBFVEgiLCAiYXR0cmlidXRlcyI6IFt7InRyYWl0X3R5cGUiOiAiY29vbG5lc3MiLCAidmFsdWUiOiAxMDB9XSwgImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCMmFXVjNRbTk0UFNJd0lEQWdNakF3SURJd01DSWdkMmxrZEdnOUlqUXdNQ0lnSUdobGFXZG9kRDBpTkRBd0lpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBnb2dJRHhqYVhKamJHVWdZM2c5SWpFd01DSWdZM2s5SWpFd01DSWdabWxzYkQwaWVXVnNiRzkzSWlCeVBTSTNPQ0lnYzNSeWIydGxQU0ppYkdGamF5SWdjM1J5YjJ0bExYZHBaSFJvUFNJeklpOCtDaUFnUEdjZ1kyeGhjM005SW1WNVpYTWlQZ29nSUNBZ1BHTnBjbU5zWlNCamVEMGlOakVpSUdONVBTSTRNaUlnY2owaU1USWlMejRLSUNBZ0lEeGphWEpqYkdVZ1kzZzlJakV5TnlJZ1kzazlJamd5SWlCeVBTSXhNaUl2UGdvZ0lEd3ZaejRLSUNBOGNHRjBhQ0JrUFNKdE1UTTJMamd4SURFeE5pNDFNMk11TmprZ01qWXVNVGN0TmpRdU1URWdOREl0T0RFdU5USXRMamN6SWlCemRIbHNaVDBpWm1sc2JEcHViMjVsT3lCemRISnZhMlU2SUdKc1lXTnJPeUJ6ZEhKdmEyVXRkMmxrZEdnNklETTdJaTgrQ2p3dmMzWm5QZz09In0=`
let tokenFinalURISad = `data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiQW4gTkZUIHdob3NlIGhhcHBpbmVzcyBjaGFuZ2VzIGJhc2VkIG9uIHRoZSBwcmljZSBvZiBFVEgiLCAiYXR0cmlidXRlcyI6IFt7InRyYWl0X3R5cGUiOiAiY29vbG5lc3MiLCAidmFsdWUiOiAxMDB9XSwgImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQRDk0Yld3Z2RtVnljMmx2YmowaU1TNHdJaUJ6ZEdGdVpHRnNiMjVsUFNKdWJ5SS9QZ284YzNabklIZHBaSFJvUFNJeE1ESTBjSGdpSUdobGFXZG9kRDBpTVRBeU5IQjRJaUIyYVdWM1FtOTRQU0l3SURBZ01UQXlOQ0F4TURJMElpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBnb2dJRHh3WVhSb0lHWnBiR3c5SWlNek16TWlJR1E5SWswMU1USWdOalJETWpZMExqWWdOalFnTmpRZ01qWTBMallnTmpRZ05URXljekl3TUM0MklEUTBPQ0EwTkRnZ05EUTRJRFEwT0MweU1EQXVOaUEwTkRndE5EUTRVemMxT1M0MElEWTBJRFV4TWlBMk5IcHRNQ0E0TWpCakxUSXdOUzQwSURBdE16Y3lMVEUyTmk0MkxUTTNNaTB6TnpKek1UWTJMall0TXpjeUlETTNNaTB6TnpJZ016Y3lJREUyTmk0MklETTNNaUF6TnpJdE1UWTJMallnTXpjeUxUTTNNaUF6TnpKNklpOCtDaUFnUEhCaGRHZ2dabWxzYkQwaUkwVTJSVFpGTmlJZ1pEMGlUVFV4TWlBeE5EQmpMVEl3TlM0MElEQXRNemN5SURFMk5pNDJMVE0zTWlBek56SnpNVFkyTGpZZ016Y3lJRE0zTWlBek56SWdNemN5TFRFMk5pNDJJRE0zTWkwek56SXRNVFkyTGpZdE16Y3lMVE0zTWkwek56SjZUVEk0T0NBME1qRmhORGd1TURFZ05EZ3VNREVnTUNBd0lERWdPVFlnTUNBME9DNHdNU0EwT0M0d01TQXdJREFnTVMwNU5pQXdlbTB6TnpZZ01qY3lhQzAwT0M0eFl5MDBMaklnTUMwM0xqZ3RNeTR5TFRndU1TMDNMalJETmpBMElEWXpOaTR4SURVMk1pNDFJRFU1TnlBMU1USWdOVGszY3kwNU1pNHhJRE01TGpFdE9UVXVPQ0E0T0M0Mll5MHVNeUEwTGpJdE15NDVJRGN1TkMwNExqRWdOeTQwU0RNMk1HRTRJRGdnTUNBd0lERXRPQzA0TGpSak5DNDBMVGcwTGpNZ056UXVOUzB4TlRFdU5pQXhOakF0TVRVeExqWnpNVFUxTGpZZ05qY3VNeUF4TmpBZ01UVXhMalpoT0NBNElEQWdNQ0F4TFRnZ09DNDBlbTB5TkMweU1qUmhORGd1TURFZ05EZ3VNREVnTUNBd0lERWdNQzA1TmlBME9DNHdNU0EwT0M0d01TQXdJREFnTVNBd0lEazJlaUl2UGdvZ0lEeHdZWFJvSUdacGJHdzlJaU16TXpNaUlHUTlJazB5T0RnZ05ESXhZVFE0SURRNElEQWdNU0F3SURrMklEQWdORGdnTkRnZ01DQXhJREF0T1RZZ01IcHRNakkwSURFeE1tTXRPRFV1TlNBd0xURTFOUzQySURZM0xqTXRNVFl3SURFMU1TNDJZVGdnT0NBd0lEQWdNQ0E0SURndU5HZzBPQzR4WXpRdU1pQXdJRGN1T0MwekxqSWdPQzR4TFRjdU5DQXpMamN0TkRrdU5TQTBOUzR6TFRnNExqWWdPVFV1T0MwNE9DNDJjemt5SURNNUxqRWdPVFV1T0NBNE9DNDJZeTR6SURRdU1pQXpMamtnTnk0MElEZ3VNU0EzTGpSSU5qWTBZVGdnT0NBd0lEQWdNQ0E0TFRndU5FTTJOamN1TmlBMk1EQXVNeUExT1RjdU5TQTFNek1nTlRFeUlEVXpNM3B0TVRJNExURXhNbUUwT0NBME9DQXdJREVnTUNBNU5pQXdJRFE0SURRNElEQWdNU0F3TFRrMklEQjZJaTgrQ2p3dmMzWm5QZ289In0=`

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
                  assert.equal(lowSVG, sadImageURI)
              })
              it("The function svgToImage() produces the right base64 SVG Image URI for the high SVG", async () => {
                  const highSVG = await dynamicSvgNft.getHighSVG()
                  assert.equal(highSVG, happyImageURI)
              })
          })

          describe("mintNft() function", () => {
              //proved "s_tokenIdToHighValue[tokenId] = highValue" in tokenURI()'s test because there's no way to call the mapping directly because its private
              it("Updates the token counter with +1 after mintNft() is called", async () => {
                  const tokenCounterBefore = await dynamicSvgNft.getTokenCounter()
                  const price = ethers.utils.parseEther("1400")
                  await dynamicSvgNft.mintNft(price)
                  const tokenCounterAfter = await dynamicSvgNft.getTokenCounter()
                  assert(tokenCounterBefore < tokenCounterAfter)
                  assert.equal(tokenCounterAfter.toNumber(), tokenCounterBefore.add(1).toNumber())
              })
              it("Mints the nft, proved by emiting the transfer event", async () => {
                  const price = ethers.utils.parseEther("1400")
                  await expect(dynamicSvgNft.mintNft(price)).to.emit(dynamicSvgNft, "Transfer")
              })
              it("Mints the nft, proved by updating the owners mapping. Also proves the first line of mintNft()", async () => {
                  const price = ethers.utils.parseEther("1400")
                  await dynamicSvgNft.mintNft(price)
                  const owner = await dynamicSvgNft.ownerOf(0)
                  assert.equal(owner, deployer.address)
              })
              it("Emits the CreatedNFT event", async () => {
                  const price = ethers.utils.parseEther("1400")
                  await expect(dynamicSvgNft.mintNft(price)).to.emit(dynamicSvgNft, "CreatedNFT")
              })
          })
          describe("_baseURI() function", () => {
              it("tokenURI() returns a string with the prefix from _baseURI() included in the beginning", async () => {
                  const price = ethers.utils.parseEther("1400")
                  await dynamicSvgNft.mintNft(price)
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
              it("The mock was deployed properly and provides the price we provided (1400)", async () => {
                  let price = await mockV3Aggregator.getAnswer(1)
                  let priceProvided = ethers.utils.parseEther("1400")
                  assert.equal(price.toString(), priceProvided)
              })
              it("Provides the happy tokenURI when the market price is higher than the price provided in mintNft", async () => {
                  let price = ethers.utils.parseEther("1300")
                  await dynamicSvgNft.mintNft(price)
                  let tokenURI = await dynamicSvgNft.tokenURI(0)
                  assert.equal(tokenURI, tokenFinalURIHappy)
              })
              it("Provides the sad tokenURI when the market price is lower than the price provided in mintNft", async () => {
                  //with this I also proved the line from mintnft() which states "s_tokenIdToHighValue[tokenId] = highValue". Can only be proved here due to the mapping being private
                  let price = ethers.utils.parseEther("1500")
                  await dynamicSvgNft.mintNft(price)
                  let tokenURI = await dynamicSvgNft.tokenURI(0)
                  assert.equal(tokenURI, tokenFinalURISad)
              })
          })
      })

// Patrick in his tests added in just 1 of his .mintNft() the .wait(1). Maybe I should aswell, probably in all my transactions, or not?
//               const txResponse = await dynamicSvgNft.mintNft(highValue)
//               await txResponse.wait(1)
