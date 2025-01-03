// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Temp {
    string public content;
    uint256 public baseFee;

    function bytesAction(string memory _content) public returns (uint256) {
        //return keccak256("test");
        content = _content;

        return gasleft();
    }

    function bytesToString(bytes memory _content) public returns (bytes memory) {
        return abi.decode(_content);
    }
}
