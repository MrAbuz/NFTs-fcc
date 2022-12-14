// SPDX-License-Identifier: MIT

// In order to call a function using only the data field of call, we need to encode:
// The function name
// The parameters we want to add
// Down to the binary level

// Now each contract assigns each function it has a function ID. This is known as the "function selector".
// The "function selector" is the first 4 bytes of the function signature. (we can get the function selector in a bunch of different ways besides this one)
// The "function signature" is a string that defines the function name & parameters.
// Let's look at this

pragma solidity ^0.8.7;

//we tried this in remix

contract CallAnything {
    address public s_someAddress;
    uint256 public s_amount;

    function transfer(address someAddress, uint256 amount) public {
        s_someAddress = someAddress;
        s_amount = amount;
    }

    function getSelectorOne() public pure returns (bytes4 selector) {
        //this is one of the ways to get the function selector, we'll go through some more in this file
        //bytes4 I guess because the function selector is the first 4 bytes of the function signature
        //transfer(address,uint256) is the function signature
        //we hash with keccak256
        selector = bytes4(keccak256(bytes("transfer(address,uint256)")));
        //this returns: 0xa9059cbb (function selector)
        //(this tells solidity that when a call is made to this contract, if this is in the data, then the transaction refers to the transfer() function).
    }

    function getDataToCallTransfer(
        address someAddress,
        uint256 amount
    ) public pure returns (bytes memory) {
        //now we're gonna need to encode the parameters with our function selector
        //since we have the function selector, we can do abi.encodeWithSelector
        //this will get us the binary encoded data that we need to put in the data field of a transaction in order to call the transfer() function with
        //this address and amount as arguments with specific values
        return abi.encodeWithSelector(getSelectorOne(), someAddress, amount);
        //this returns: 0xa9059cbb0000000000000000000000007ef2e0048f5baede046f6bf797943daf4ed8cb470000000000000000000000000000000000000000000000000000000000000309
        //(result made with address "0x7EF2e0..." and "777" amount as arguments)
    }

    //with all this, we can call the transfer() function directly:

    function callTransferFunctionDirectly(
        address someAddress,
        uint256 amount
    ) public returns (bytes4, bool) {
        //using abi.encodeWithSelector
        (bool success, bytes memory returnData) = address(this).call(
            // getDataToCallTransfer(someAddress, amount)
            abi.encodeWithSelector(getSelectorOne(), someAddress, amount)
        );
        return (bytes4(returnData), success);
        // this returns a returnData which is gonna be whatever the call returns, and a bool to know whether or not the transaction was successfull
        // it returned 0x00000000
        //             true
        // we just called the transfer() function directly by passing those parameters without having to call the transfer() function itself
    }

    function callTransferFunctionDirectlyTwo(
        address someAddress,
        uint256 amount
    ) public returns (bytes4, bool) {
        // we can also use abi.encodeWithSignature
        // "abi.encodeWithSignature(string memory signature, ...)" is equivalent to "abi.encodeWithSelector(bytes4(keccak256(bytes(signature)), ...)"
        // basically turns the signature into the selector for us
        // looks way easier
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSignature("transfer(address,uint256)", someAddress, amount)
        );
        return (bytes4(returnData), success);
        // it returned 0x00000000
        //             true
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------
    //
    // Now, there's a bunch of different ways to get the function selector and we'll not code them out ourselves
    // There's a ton of reasons why you might wanna get the selector in different ways, and here's some of those ways.
    // We didnt go over this function selector getting methods, but I copied from our github repo and they have a bunch of comments that explain what they're doing:
    // We have seen getSelectorOne(), and we'll see from getSelectorTwo() to getSelectorFour().
    // Here are some of those other ways to get the function selector (easily understood all of them):
    //
    //

    // We can also get a function selector from data sent into the call
    function getSelectorTwo() public view returns (bytes4 selector) {
        bytes memory functionCallData = abi.encodeWithSignature(
            "transfer(address,uint256)",
            address(this),
            123
        );
        selector = bytes4(
            bytes.concat(
                functionCallData[0],
                functionCallData[1],
                functionCallData[2],
                functionCallData[3]
            )
        );

        //Mine: This is easy to understand. The functionCallData is the encoded data to call transfer(), and as I've seen above in the results from getSelectorOne()
        //      and getDataToCallTransfer(), that bytes data starts with the function selector and the function selector has 4 bytes. Here we are extracting those first
        //      4 bytes and concatenating them. bytes.concat() as its explained in the beginning of Encoding.sol is a way we can use to concatenate.
        //      So we use the call data to extract the selector.
        //      It returned:  0xa9059cbb
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------
    //This is to be used in getSelectorThree()
    function getCallData() public view returns (bytes memory) {
        return abi.encodeWithSignature("transfer(address,uint256)", address(this), 123);
    }

    // Pass this: 0xa9059cbb000000000000000000000000d7acd2a9fd159e69bb102a1ca21c9a3e3a5f771b000000000000000000000000000000000000000000000000000000000000007b
    // This is the output of `getCallData()`
    // This is another low level way to get function selector using assembly
    // You can actually write code that resembles the opcodes using the assembly keyword!
    // This in-line assembly is called "Yul"
    // It's a best practice to use it as little as possible - only when you need to do something very VERY specific
    function getSelectorThree(
        bytes calldata functionCallData
    ) public pure returns (bytes4 selector) {
        // offset is a special attribute of calldata
        assembly {
            selector := calldataload(functionCallData.offset)
        }
        // Mine: In yul ":=" means "=". calldataload is the name of an opcode.
        //       This looks to fit the same purpose as getSelectorTwo(), as you also need the data sent into the call to extract the selector.
        //       So here we use the call data to extract the selector aswell.
        //       It returned: 0xa9059cbb
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------
    // Another way to get your selector with the "this" keyword
    function getSelectorFour() public pure returns (bytes4 selector) {
        return this.transfer.selector;
    }

    // Mine: So we type the function name (transfer) inside this."".selector and we get the selector?
    //       Looks to be good if we already have the function declared
    //       It returned: 0xa9059cbb

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------
    //
    // TLDR: Basically from my analysis the getSelectorOne() requires us to know the function signature, the getSelectorTwo and Three requires us to know the data that was
    //      used to call that function before, and the getSelectorFour() probably requires us to have the function already declared. Probably the way is We can just get the
    //      call data from the signature using encodeWithSignature, but prob if we dont have it, we get the selector from this/other ways.
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
//
//Now we're gonna see how 2 contracts can interact with eachother without actually having all of the code for each contract:

contract CallFunctionWithoutContract {
    address public s_selectorsAndSignaturesAddress;

    constructor(address selectorsAndSignaturesAddress) {
        s_selectorsAndSignaturesAddress = selectorsAndSignaturesAddress;
    }

    // pass in 0xa9059cbb000000000000000000000000d7acd2a9fd159e69bb102a1ca21c9a3e3a5f771b000000000000000000000000000000000000000000000000000000000000007b
    // you could use this to change state
    function callFunctionDirectly(bytes calldata callData) public returns (bytes4, bool) {
        (bool success, bytes memory returnData) = s_selectorsAndSignaturesAddress.call(
            abi.encodeWithSignature("getSelectorThree(bytes)", callData)
        );
        return (bytes4(returnData), success);
        // Mine: Things to note: "calldata" being used instead of memory, nice.
        //       Here we're calling the getSelectorThree() function, with callData as the input parameter because its the input parameter it should receive.
        //       Nothing special, just calling from a different contract.
    }

    // with a staticcall, we can have this be a view function!
    // Staticcall: This is how (at a low level) we do our "view" or "pure" function calls, and potentially don't change the blockchain state (explained in the end of Encoding.sol)

    function staticCallFunctionDirectly() public view returns (bytes4, bool) {
        (bool success, bytes memory returnData) = s_selectorsAndSignaturesAddress.staticcall(
            abi.encodeWithSignature("getSelectorOne()")
        );
        return (bytes4(returnData), success);

        // Mine: Static call as a way to make calls that dont change the state, like "view" or "pure" function calls.
        //       getSelectorOne() is the signature
        //       Used encodeWithSignature() without parameters, because the function we're calling doesnt have parameters.
        //       Seems that we can just use encodeWithSignature() or encodeWithSelector() without any arguments.
    }

    function callTransferFunctionDirectlyThree(
        address someAddress,
        uint256 amount
    ) public returns (bytes4, bool) {
        (bool success, bytes memory returnData) = s_selectorsAndSignaturesAddress.call(
            abi.encodeWithSignature("transfer(address,uint256)", someAddress, amount)
        );
        return (bytes4(returnData), success);

        // Mine: Nothing new, just calling this from a different contract.
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------
    // Created by me for fun.
    // Receives the call data previously used to call a function and the address of the contract, and calls that function with new argument values.
    function mine(
        address someAddress,
        uint256 amount,
        bytes calldata callData,
        address targetAddress
    ) public returns (bytes4, bool) {
        bytes4 selector = bytes4(bytes.concat(callData[0], callData[1], callData[2], callData[3]));
        (bool success, bytes memory returnData) = targetAddress.call(
            abi.encodeWithSelector(selector, someAddress, amount)
        );
        return (bytes4(returnData), success);
    }
}

//This looks to be a really nice way to call other functions from other contracts if we don't have the ABI, or other reasons.
//Some reasons may include not having the ABI, or maybe all we have is the function name, or the parameters we wanna send, or maybe we wanna make our code be able
//to send arbitrary functions or make arbitrary calls, or do random really advanced stuff.

//Now, doing this call stuff is considered low level stuff, and its a best practise to try to avoid it when we can, if we can import an interface its much better, because
//you're gonna have the compiler by your side (guess this means the compiler throws error if something's wrong), you'll be able to see if your types are matching etc (gas is the same
//aswell? from what I've read with call costs less gas, need to confirm).
//Usually doing this low level calls might spook some security auditors a little bit.

//https://ethereum.stackexchange.com/questions/91826/why-are-there-two-methods-encoding-arguments-abi-encode-and-abi-encodepacked
//From a comment from here:
//Calling the function the regular way without being low level costs more gas but its safer. (like contract.function(123, 456))
//Due to the fact that the EVM considers a call to a non-existing contract to always succeed, Solidity includes an extra check using the "extcodesize" opcode when performing external calls.
//This ensures that the contract that is about to be called either actually exists (it contains code) or an exception is raised.
//The low-level calls which operate on addresses rather than contract instances (i.e. .call(), .delegatecall(), .staticcall(), .send() and .transfer()) do not include this check,
//which makes them cheaper in terms of gas but also less safe.
//Interesting.

//https://docs.soliditylang.org/en/latest/cheatsheet.html
