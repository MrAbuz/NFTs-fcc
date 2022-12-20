//DynamicSvgNft.sol
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol"; //yarn add --dev base64-sol

contract DynamicSvgNft is ERC721 {
    // Plan:
    // Mint
    // Store our SVG information somewhere
    // Some logic to say "Show X Image" or "Show Y Image"

    uint256 private s_tokenCounter;
    string private i_lowImageURI; //*
    string private i_highImageURI;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";

    constructor(string memory lowSvg, string memory highSvg) ERC721("Dynamic SVG NFT", "DSN") {
        //we're passing in the svg code as input parameters
        s_tokenCounter = 0;
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        // (22:10:55) when I open the SVG image on github, there's a button right above the picture in the right that says: "Display the source blob". Clicking there will display the SVG code.
        // But we need an image URI and we just have the SVG code (which is a big code).
        // What we'll do is convert on-chain this SVG into an image URI
        // Instead of having ipfs:// as the start, we're gonna use base 64 encoding. We can encode any SVG into a base 64 image URI.
        // https://base64.guru/converter/encode/image/svg (we're using this site)
        // Right click in the svg image in the github and "copy image address", and in that site: Datatype: Remote URL; Remote URL: We paste it in here; Output Format: Plain text - just the base 64 value.
        // Then click: Encode SVG to Base64.
        // We could also upload the image from an SVG Image we have as a file on the pc by chosing "local file".
        // And we'll ge the base 64 encoding that represents the SVG we just inputed.
        // In our browser we can type:
        // "data:image/svg+xml;base64,(then paste that base 64 encoding we got)" -> we get exactly that image again
        // We can use this on chain as the image URI for our images.
        //
        // But instead, we're gonna do this base 64 encoding on-chain. We could 100% do this off-chain if we want to save some gas, but it's kinda fun to show how to do this all on-chain.
        // (Off-chain this means we could instead input this image URI we get from this process above as inputs in the constructor, instead of inputing the SVG code, right?)
        // We imported a contract that will help us encode and decode the SVG, created by one guy from Loopring. The github repo of that code is in patrick's github.
        // So in this function, we're gonna give this function an SVG, encode it using base 64 encoding, and its gonna return a string which is that base 64 encoded URI, like the one above we got in the off-chain way:

        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }
}
