// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

event Log(string);
event PollAdded(bytes32 indexed pollId, string metadata, string q,uint256 start,uint256 end, address sender);
event PollUpdated(bytes32 indexed pollId,  address sender);
event RespondAdded(bytes32 indexed pollId, address sender);
event FeeUpdated(bytes32 indexed id, bytes32 brandId, address sender);