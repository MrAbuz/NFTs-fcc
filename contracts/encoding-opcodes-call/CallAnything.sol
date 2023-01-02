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

error CallAnything__biggestErrorEver();

contract CallAnything {
    address public s_someAddress;
    uint256 public s_amount;

    function transfer(address someAddress, uint256 amount) public {
        s_someAddress = someAddress;
        s_amount = amount;
    }

    function getSelectorOne() public pure returns (bytes4 selector) {
        //patrick will show us a few ways to get the function selector
        //bytes4 I guess because the function selector is the first 4 bytes of the function signature
        //we hash with keccak256
        selector = bytes4(keccak256(bytes("transfer(address,uint256)")));
        //this returns: 0xa9059cbb
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

    function callTransferFunctionDirectlySig(
        address someAddress,
        uint256 amount
    ) public returns (bytes4, bool) {
        //we can also do encodeWithSignature instead
        // "abi.encodeWithSignature(string memory signature, ...)" is equivalent to "abi.encodeWithSelector(bytes4(keccak256(bytes(signature)), ...)"
        //basically turns the signature into the selector for us
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSignature("transfer(address,uint256)", someAddress, amount)
        );
        return (bytes4(returnData), success);
    }

    // Now, there's a bunch of different ways to get the selector and we'll not code this out ourselves
    // There's a ton of reasons why you might wanna get the selector in a different way, and here's some
    // We didn't go over this next function selector getting methods, but I copied from the github repo and they have a bunch of comments that explain what they're doing:
}

//https://docs.soliditylang.org/en/latest/cheatsheet.html
