// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

//we tried this in remix

contract Encoding {
    function combineStrings() public pure returns (string memory) {
        //abi.encodePacked returns a bytes object, and we're typecasting it by wrapping it in a string
        //abi.encodePacked is a globally available methods & units
        return string(abi.encodePacked("Hi mom! ", "Miss you!"));
    }

    //In 0.8.12 + we can already do: "string.concat(stringA, stringB);" if we want instead of abi.encodePacked() for the same result, but he showed abi.encodePacked()
    //because its a good intro for what we're about to go over.

    //When we send a transaction, it is "compiled" down to bytecode and sent in a "data" object of the transaction.

    // Now, in order to read and understand these bytes, you need a special reader.
    // This is supposed to be a new contract? How can you tell?

    // This bytecode represents exactly the low level computer instructions to make our contract happen.
    // These low level instructions are spread out into something called opcodes.
    // The opcodes are kind of like the alphabet or the language of this binary stuff.

    // An opcode is going to be 2 characters that represents some special instruction, and also optionally have an input

    // You can see a list of them here:
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
        //this returns: 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b736f6d6520737472696e673000000000000000000000000000000000000000000
        //(there's a lot of zeros and this zeros take space)
    }

    function encodeStringPacked() public pure returns (bytes memory) {
        // abi.encodePacked() is great if you want to save space, not good for calling functions.
        // You can sort of think of it as a compressor for the massive bytes object that were returned above.
        // (this) "If we wanted to encode some string but we wanted to save space and we didnt need the perfect low level binary of it, we can use abi.encodePacked".
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
        //this returns: 0x736f6d6520737472696e67
    }

    function decodeString() public pure returns (string memory) {
        //we can also decode stuff, choosing the type that we want to decode into (in this case to a string)
        string memory someString = abi.decode(encodeString(), (string));
        return someString;
        //this returns: some string
    }

    function multiEncode() public pure returns (bytes memory) {
        //we can also multiEnconde and multiDecode
        bytes memory someString = abi.encode("some string", "it's bigger!");
        return someString;
        //this returns: 0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000b736f6d6520737472696e67000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c6974277320626967676572210000000000000000000000000000000000000000
    }

    function multiDecode() public pure returns (string memory, string memory) {
        (string memory someString, string memory someOtherString) = abi.decode(
            multiEncode(),
            (string, string)
        );
        return (someString, someOtherString);
        //this returns: some string
        //              it's bigger!
    }

    function multiEncodePacked() public pure returns (bytes memory) {
        //we can even multi encode using the encodepacked
        bytes memory someString = abi.encodePacked("some string ", "it's bigger!");
        return someString;
        //this returns: 0x736f6d6520737472696e6720697427732062696767657221
    }

    //this doesn't work
    //we cant decode something that we encode packed
    //doesn't work because it's from the packed encoded bytes of the two strings
    function multiDecodePacked() public pure returns (string memory) {
        string memory someString = abi.decode(multiEncodePacked(), (string));
        return someString;
        //this gives an error
    }

    function multiStringCastPacked() public pure returns (string memory) {
        //what we can actually do
        string memory someString = string(multiEncodePacked());
        return someString;
        //this returns: some string it's bigger!
    }

    // Since with encoding we get the binary, we can use this encoding stuff to make calls to functions where we populate the data field with our function call code.
    // With the exact function we wanna call in the binary format
    // "But why would we do that? I can always just use the interface, the abi etc"
    // -> Answer: maybe we dont have that, maybe all we have is the function name, or the parameters we wanna send,
    // or maybe we wanna make our code be able to send arbitrary functions or make arbitrary calls, or do random really advanced stuff

    // Remember how before I said you always need two things to call a contract:
    // 1. ABI
    // 2. Contract Address?
    // Well... That was true, but you don't need that massive ABI file. All we need to know is how to create the binary to call the functions that we want to call.

    // Solidity has some more "low-level" keywords, namely "staticcall" and "call". We've used call in the past, but
    // haven't really explained what was going on. There is also "send"... but basically forget about send.

    // call: How we call functions to change the state of the blockchain.
    // staticcall: This is how (at a low level) we do our "view" or "pure" function calls, and potentially don't change the blockchain state.

    // Later on we'll learn another one called delegatecall, but let's not worry about that for now
    // When you call a function, you are secretly calling "call" behind the scenes, with everything compiled down to the binary stuff for you.
    // Flashback to when we withdrew ETH from our raffle:

    function withdraw(address recentWinner) public {
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        require(success, "Transfer Failed");
    }

    // Remember this?
    // - In our {} we are able to pass specific fields of a transaction, like value (also Gas Price and Gas Limit, and probably more).
    // - In our () we are able to pass data in order to call a specific function - but there was no function we wanted to call!
    // We only sent ETH, so we didn't need to call a function!
    // If we want to call a function, or send any data, we'd do it in these parathesis!

    // Let's now learn how we can populate the data field and call any function and do essentially what the blockchain is gonna do at the low level
    // Let's look at another contract to explain this more...
}

// 22:20:04 starts explaining about abi, bin etc

// https://docs.soliditylang.org/en/latest/cheatsheet.html
