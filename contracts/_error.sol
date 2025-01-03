// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

error Reverted();
error Unauthorized();
error TooEarly(uint256 now);
error TooLate(uint256 now);
error PriceNotMet(uint256 value, uint256 amount);
error NotAuthorizedAmount(uint256 totalAmount, uint256 authorizedAmount);
error NotWhitelisted(bytes32 pollId, address sender);
error RepetitiveResponse(address sender);