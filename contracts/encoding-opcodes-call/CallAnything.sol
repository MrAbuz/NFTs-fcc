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
        //this will get us the data that we need to put in the data field of a transaction in order to call the transfer() function with this address and amount as
        //arguments
        return abi.encodeWithSelector(getSelectorOne(), someAddress, amount);
        //this returns: 0xa9059cbb0000000000000000000000007ef2e0048f5baede046f6bf797943daf4ed8cb470000000000000000000000000000000000000000000000000000000000000309
        //(this is the binary encoded data that we add to the data field to call the transfer function, with address "0x7EF2e0..." and "777" amount as arguments)
    }

    //with all this, we can call the transfer() function without calling it directly:
}

//https://docs.soliditylang.org/en/latest/cheatsheet.html
