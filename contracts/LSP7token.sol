// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol";
import {_LSP4_TOKEN_TYPE_TOKEN} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {LSP7DigitalAsset} from "@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol";
import "./_error.sol";

/// @title LSP7test
/// @author Aratta Labs
/// @notice Fish token
/// @dev You will find the deployed contract addresses on the official website
/// @custom:emoji 🦾
/// @custom:security-contact atenyun@gmail.com
contract LSP7Token is LSP7Mintable, LSP7Burnable {
    uint256 public constant tokenSupplyCap = 500_000_000 ether;

    constructor() LSP7Mintable("LSP7Token", "LST", msg.sender, _LSP4_TOKEN_TYPE_TOKEN, false) {
        mint(msg.sender, 100_000_000 * 10**decimals(), true, "");
    }
}
