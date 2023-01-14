//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol"; //yarn add --dev base64-sol

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;

    AggregatorV3Interface internal immutable i_priceFeed; //nice how this has to be internal I guess because its being used in an overriden function from an inherited contract
    mapping(uint256 => int256) private s_tokenIdToHighValue; //tokenId to eth price that the user wants his nft to change its happiness

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        s_lowImageURI = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //Some functions to add some more functionality later on:

    // function setLowURI(string memory svgLowURI) public onlyOwner { _
    //     s_lowImageURI = svgLowURI;
    // }

    // function setHighURI(string memory svgHighURI) public onlyOwner {
    //     s_highImageURI = svgHighURI;
    // }

    // function setLowSVG(string memory svgLowRaw) public onlyOwner {
    //     string memory svgURI = svgToImageURI(svgLowRaw);
    //     setLowURI(svgURI);
    // }

    // function setHighSVG(string memory svgHighRaw) public onlyOwner {
    //     string memory svgURI = svgToImageURI(svgHighRaw);
    //     setHighURI(svgURI);
    // }

    // function userChangeETHPrice(int256 ethPrice, uint256 tokenId) external { funny one I did for the user to be able to change the eth price after minting
    // add error DynamicSvgNft__userIsntTheOwner();
    //    if (balanceOf(msg.sender) == 0 || ownerOf(tokenId) != msg.sender) {
    //        revert DynamicSvgNft__userIsntTheOwner();
    //    }
    //    s_tokenIdToHighValue[tokenId] = ethPrice;
    //}

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        // (22:10:55) when I open the SVG image on github, there's a button right above the picture in the right that says: "Display the source blob". Clicking there will display the SVG code.
        // But we need an image URI and we just have the SVG code (which is a big code).
        // What we'll do is convert on-chain this SVG into an image URI
        // Instead of having ipfs:// as the start, we're gonna use base 64 encoding. We can encode any SVG into a base 64 image URI.
        // https://base64.guru/converter/encode/image/svg
        // Right click in the svg image in the github and "copy image address", and in that site: Datatype: Remote URL; Remote URL: We paste it in here; Output Format: Plain text - just the base 64 value.
        // Then click: Encode SVG to Base64.
        // We could also upload the image from an SVG Image we have as a file on the pc by choosing "local file".
        // And we'll get the base 64 encoding that represents the SVG we just inputed.
        // In our browser we can type:
        // "data:image/svg+xml;base64,(then paste that base 64 encoding we got)" -> we get exactly that image again
        // We can use this on chain as the image URI for our images.
        //
        // But instead, we're gonna do this base 64 encoding on-chain. We could 100% do this off-chain if we want to save some gas, but it's kinda fun to show how to do this all on-chain.
        // (Off-chain this means we could instead input this image URI we get from this process above as inputs in the constructor, instead of inputing the SVG code, right?)
        // We imported a contract that will help us encode and decode the SVG, created by one guy from Loopring. The github repo of that code is in patrick's github.
        // So in this function, we're gonna give this function an SVG, encode it using base 64 encoding, and its gonna return a string which is that base 64 encoded URI, like the one above that
        // we got in the off-chain way:

        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg)))); //do we add string here cuz the svg might have weird symbols? cuz below in json base64.encode we didnt
        return string(abi.encodePacked(baseURL, svgBase64Encoded)); //could've also used string.concat(stringA, stringB) in 0.8.12 + I think
    }

    function mintNft(int256 highValue) public {
        uint256 tokenId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        s_tokenIdToHighValue[tokenId] = highValue; //we'll let the minters choose the eth price that they wanna use for their nft
        _safeMint(msg.sender, tokenId);
        emit CreatedNFT(tokenId, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        //ERC721.sol has a _baseURI() that we're gonna override with the prefix for the token URI (base64 json)
        //nice, this is a empty function that they included in ERC721.sol if we need to add a prefix.
        //but as we're overriding tokenURI thus not using any of their configurations with _baseURI as far as I see, probably not worth the mess to use this but lets see
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        //So we base64 encoded our image into an image URI.
        //Now we're gonna stick that image URI into a json with the metadata and base64 encode the json to get the token URI.
        //We'll override the tokenURI function of the ERC721

        if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_highImageURI;

        if (price < s_tokenIdToHighValue[tokenId]) {
            imageURI = s_lowImageURI;
        }

        //Now, basically the same thing we did above in svgToImageURI() to get the URI but here its all in the same line.
        //abi.encodePacked(prefix which is baseURI, with the base64 encoded json)
        //would probably be a lot easier to read if we typed it separated but its easy to understand
        //data:image/svg+xml;base64, is the prefix for the Base64 svg image
        //But for base64 json we use:
        //data:application/json;base64,

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT whose happiness changes based on the price of ETH", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                            //we used single quotes (') here because inside the json we used some double quotes ("")
                            //interesting the way to concatenate text with functions
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
