// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract Encoding {
    function combineStrings() public pure returns (string memory) {
        //abi.encodePacked returns a bytes object, and we're typecasting it by wrapping it in a string
        //abi.encodePacked is a globally available methods & units
        return string(abi.encodePacked("Hi mom! ", "Miss you!"));
    }

    //In 0.8.12 + we can already do: "string.concat(stringA, stringB);" if we want instead of abi.encodePacked() for the same result, but he showed abi.encodePacked()
    //because its a good intro for what we're about to go over.

    //When we send a transaction, it is "compiled" down to bytecode and sent in a "data" object of the transaction.
    //For example: https://rinkeby.etherscan.io/tx/0x924f592458b0e37ee17024f9c826b97697455cd97f6946b802bc422966e77ae43

    // Now, in order to read and understand these bytes, you need a special reader.
    // This is supposed to be a new contract? How can you tell?
    // When you compile a contract in Hardhat you get the "bytecode" output, that's that will be sent when creating a contract.

    // This bytecode represents exactly the low level computer instructions to make our contract happen.
    // These low level instructions are spread out into something call opcodes.
    // The opcodes are kind of like the alphabet or the language of this binary stuff.

    // An opcode is going to be 2 characters that represents some special instruction, and also optionally has an input

    // You can see a list of there here:
    // https://www.evm.codes/
    // Or here:
    // https://github.com/crytic/evm-opcodes

    // This opcode reader is sometimes abstractly called the EVM - or the ethereum virtual machine.
    // The EVM basically represents all the instructions a computer needs to be able to read.
    // Any language that can compile down to bytecode with these opcodes is considered EVM compatible
    // Which is why so many blockchains are able to do this,you just get them to be able to understand the EVM and presto!Solidity smart contracts work on those blockchains.

    // Now, just the binary can be hard to read, so why not press the `assembly` button? You'll get the binary translated into the opcodes and inputs for us!
    // We aren't going to go much deeper into opcodes, but they are important to know to understand how to build more complex apps.

    // How does this relate back to what we are talking about?
    // We can encode pretty much anything we want to be in this binary format.
    // In this function, we encode the number "one" to what it'll look like in binary.

    // Or put another way, we ABI encode it.

    function encodeNumber() public pure returns (bytes memory) {
        //we are encoding this number down to its binary format. to the perfect low level binary version of it
        //"ok number 1, let's make you machine readable". how the computer understands the number 1
        bytes memory number = abi.encode(1);
        return number; //this returns: 0x0000000000000000000000000000000000000000000000000000000000000001
    }

    // You'd use this to make calls to contracts
    function encodeString() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("some string");
        return someString;
        //this returns: 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b736f6d6520737472696e67000000000000000000000000000000000000000000
        //(there's a lot of zeros and this zeros take space)
    }

    function encodeStringPacked() public pure returns (bytes memory) {
        // abi.encodePacked() is great if you want to save space, not good for calling functions.
        // You can sort of think of it as a compressor for the massive bytes object that were returned above.
        // "If we wanted to encode some string but we wanted to save space and we didnt need the perfect low level binary of it, we can use abi.encodePacked".
        // If we need the perfect low level binary version we use abi.encode()
        // we can save a lot more gas with abi.encodePacked
        bytes memory someString = abi.encodePacked("some string");
        return someString;
        //this returns: 0x736f6d6520737472696e67
    }

    function encodeStringBytes() public pure returns (bytes memory) {
        //typecasting will return nearly identical as the abi.encodePacked above
        bytes memory someString = bytes("some string");
        return someString;
    }
}

//Experimented all of this in Remix

// https://docs.soliditylang.org/en/latest/cheatsheet.html

// 22:20:04 starts explaining about abi, bin etc
