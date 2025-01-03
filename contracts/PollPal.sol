// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ILSP7DigitalAsset as ILSP7} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {MESSAGE_TOO_LATE, MESSAGE_TOO_SOON} from "./_constant.sol";
import "./_event.sol";
import "./_error.sol";
import "./_pausable.sol";
import "./_ownable.sol";

/// @title PollPal
/// @author Aratta Labs
/// @notice PollPal contract
/// @dev You will find the deployed contract addresses in the repo
/// @custom:version 1
/// @custom:emoji 📊
/// @custom:security-contact atenyun@gmail.com
contract PollPal is Ownable(msg.sender), Pausable {
    // Data members
    using Counters for Counters.Counter;

    Counters.Counter public _pollCounter;
    Counters.Counter public _respondCounter;

    uint256 public fee = 0 ether;

    struct PollStruct {
        string metadata;
        bytes q;
        string[] choices;
        uint256 start;
        uint256 end;
        address[] whitelist;
        address manager;
        uint256 limitPerAccount;
        bool isPayable;
        address token;
        uint256 amount;
        bool pause;
        uint256 dt;
        uint256 respondCounter;
    }

    struct PollListStruct {
        bytes32 id;
        string metadata;
        bytes q;
        string[] choices;
        uint256 start;
        uint256 end;
        address[] whitelist;
        uint256 limitPerAccount;
        uint256 price;
        address manager;
        bool pause;
        uint256 dt;
        uint256 respondCounter;
    }

    struct RespondStruct {
        bytes32 pollId;
        string metadata;
        uint8 choice;
        address sender;
        uint256 dt;
    }

    struct RespondListStruct {
        bytes32 respondId;
        bytes32 pollId;
        string metadata;
        uint8 choice;
        address sender;
        uint256 dt;
    }

    mapping(bytes32 => PollStruct) public poll;
    mapping(bytes32 => RespondStruct) public respond;
    mapping(bytes32 => mapping(bytes32 => string)) public blockStorage;
    mapping(bytes32 => mapping(address => uint256)) public respondCounter;
    mapping(address => bytes32[]) public pollAccount;
    // mapping(bytes32 pollId => mapping(address sender => string metadata)) public respond;

    ///@dev Throws if called by any account other than the manager.
    modifier onlyManager(bytes32 _pollId) {
        require(poll[_pollId].manager == _msgSender(), "The sender is not the manager of the entered pollId.");
        _;
    }

    constructor() {
        // whitelist sender
        address[] memory _whitelist = new address[](0);
        //_whitelist[0] = _msgSender();        // _whitelist[1] = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
        string[] memory _choices = new string[](3);
        _choices[0] = "Option 1";
        _choices[1] = "Option 2";
        _choices[2] = "Option 3";
        _pollCounter.increment();
        poll[bytes32(_pollCounter.current())] = PollStruct({
            metadata: "",
            q: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            choices: _choices,
            start: block.timestamp + 10,
            end: block.timestamp + 1 days,
            whitelist: _whitelist,
            manager: _msgSender(),
            limitPerAccount: 1,
            isPayable: true,
            token: address(0),
            amount: 1 ether,
            pause: false,
            dt: block.timestamp,
            respondCounter: 0
        }); // mapping(address sender => mapping(uint256 dt => string metadata)) respond;
        // Log form added
        emit PollAdded(
            bytes32(_pollCounter.current()),
            "",
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            block.timestamp + 10,
            block.timestamp + 1 days,
            _msgSender()
        );
    }

    ///@notice Update fee
    function updateFee(uint256 _fee) public onlyOwner {
        fee = _fee;
    }

    /// @notice Set new key/ value
    /// @param _pollId The bytes32 ID
    /// @param _key A byte32 key
    /// @param _val Value
    /// @return boolean
    function setKey(
        bytes32 _pollId,
        bytes32 _key,
        string memory _val
    ) public onlyOwner returns (bool) {
        blockStorage[_pollId][_key] = _val;
        return true;
    }

    /// @notice Get the stored value
    /// @param _pollId The bytes32 ID
    /// @param _key A byte32 key
    /// @return value
    function getKey(bytes32 _pollId, bytes32 _key) public view returns (string memory) {
        return blockStorage[_pollId][_key];
    }

    /// @notice Delete a key from the storage
    /// @param _pollId The bytes32 ID
    /// @param _key A byte32 key
    /// @return boolean
    function delKey(bytes32 _pollId, bytes32 _key) public onlyOwner returns (bool) {
        delete blockStorage[_pollId][_key];
        return true;
    }

    /// @notice Create new poll
    function newPoll(
        string memory _metadata,
        string memory _q,
        string[] memory _choices,
        uint256 _start,
        uint256 _end,
        address[] memory _whitelist,
        uint256 _limitPerAccount,
        bool _isPayable,
        address _token, // if left empty means native token, LYX
        uint256 _amount,
        bool _pause
    ) public payable returns (bytes32) {
        /// @notice Continue if start time is gretter that current time
        require(_start > block.timestamp, "Start time must be greater than current time");

        /// @notice Continue if end time is gretter than start time
        require(_end > _start, "End time must be greater than start time");

        // Check the platform fee if the poll is not payable.
        if (_isPayable) {
            if (_msgSender() != owner()) {
                if (msg.value < fee) revert PriceNotMet(fee, msg.value);
            }
        }

        // Add the form
        _pollCounter.increment();
        poll[bytes32(_pollCounter.current())] = PollStruct({
            metadata: _metadata,
            q: bytes(_q),
            choices: _choices,
            start: _start,
            end: _end,
            whitelist: _whitelist,
            manager: _msgSender(),
            limitPerAccount: _limitPerAccount,
            isPayable: _isPayable,
            token: _token,
            amount: _amount,
            pause: _pause,
            dt: block.timestamp,
            respondCounter: 0
        });

        // Add sender to poll account
        pollAccount[_msgSender()].push(bytes32(_pollCounter.current()));

        // Log form added
        emit PollAdded(bytes32(_pollCounter.current()), _metadata, _q, _start, _end, _msgSender());

        return bytes32(_pollCounter.current());
    }

    /// @notice Update brand
    function updatePoll(
        bytes32 _pollId,
        string memory _metadata,
        bytes memory _q,
        string[] memory _choices,
        address[] memory _whitelist,
        uint256 _limitPerAccount,
        bool _isPayable,
        address _token,
        uint256 _amount,
        bool _pause
    ) public onlyManager(_pollId) {
        poll[_pollId].metadata = _metadata;
        poll[_pollId].q = _q;
        poll[_pollId].choices = _choices;
        poll[_pollId].whitelist = _whitelist;
        poll[_pollId].limitPerAccount = _limitPerAccount;
        poll[_pollId].isPayable = _isPayable;
        poll[_pollId].token = _token;
        poll[_pollId].amount = _amount;
        poll[_pollId].pause = _pause;

        emit PollUpdated(_pollId, _msgSender());
    }

    function _authorizedSender(bytes32 _pollId) internal view returns (bool) {
        for (uint256 i = 0; i <= poll[_pollId].whitelist.length; i++) if (poll[_pollId].whitelist[i] == _msgSender()) return true;
        revert NotWhitelisted(_pollId, _msgSender());
    }

    /// @notice cast vote
    function newRespond(
        bytes32 _pollId,
        string memory _metadata,
        uint8 _choice,
        bool _force,
        bytes memory _data
    ) public payable {
        // TODO: Check choice counter with poll id
        if (poll[_pollId].whitelist.length > 0) _authorizedSender(_pollId);

        /// @notice Continue if form doesn't expired
        if (poll[_pollId].start > block.timestamp) revert TooEarly(block.timestamp);

        /// @notice Continue if form doesn't expired
        require(poll[_pollId].end > block.timestamp, "The entered poll ID is expired");

        /// @notice Check if it's paused
        require(!poll[_pollId].pause, "This poll is paused");

        // @notice Check if the sender is repetitive
        if (respondCounter[_pollId][_msgSender()] >= poll[_pollId].limitPerAccount) revert RepetitiveResponse(_msgSender());
        // for (uint256 i = 0; i <= poll[_pollId].respondCounter; i++) if (respond[bytes32(i)].sender == _msgSender()) revert RepetitiveResponse(_msgSender());

        // Transfer price to the manager of the form
        if (poll[_pollId].isPayable) {
            // if it's not true, means not free
            if (address(poll[_pollId].token) == address(0)) {
                // means native token

                if (msg.value < poll[_pollId].amount) revert PriceNotMet(poll[_pollId].amount, msg.value);

                // Transfer native token
                (bool success, ) = poll[_pollId].manager.call{value: msg.value}("");
                require(success, "Failed");
            } else {
                uint256 authorizedAmount = ILSP7(poll[_pollId].token).authorizedAmountFor(address(this), _msgSender());
                if (authorizedAmount != poll[_pollId].amount) revert NotAuthorizedAmount(poll[_pollId].amount, authorizedAmount);

                // Transfer LSP7 token
                ILSP7(poll[_pollId].token).transfer(_msgSender(), address(poll[_pollId].manager), poll[_pollId].amount, _force, _data);
            }
        }

        poll[_pollId].respondCounter += 1;

        // Add sender to the respond counter storage
        respondCounter[_pollId][_msgSender()] += 1;

        _respondCounter.increment();
        respond[bytes32(_respondCounter.current())] = RespondStruct(_pollId, _metadata, _choice, _msgSender(), block.timestamp);

        emit RespondAdded(_pollId, poll[_pollId].respondCounter, _msgSender());
    }

    // Check if a poll is active
    // returns start and end time
    function pollStatus(bytes32 _pollId)
        public
        view
        returns (
            bool isActive,
            uint256 start,
            uint256 end
        )
    {
        uint256 pollStart = poll[_pollId].start;
        uint256 pollEnd = poll[_pollId].end;

        if (pollEnd > block.timestamp) return (true, pollStart, pollEnd);

        return (false, pollStart, pollEnd);
    }

    ///@notice Check form expiration
    function isExpired(bytes32 _pollId) public view returns (bool) {
        return poll[_pollId].end > block.timestamp ? false : true;
    }

    ///@notice Get list
    function pollList(address _manager) public view returns (PollListStruct[] memory polls, bool) {
        PollListStruct[] memory result = new PollListStruct[](_pollCounter.current());

        bool hasPoll = false;

        for (uint256 i = 1; i <= _pollCounter.current(); i++) {
            if (poll[bytes32(i)].manager == _manager) {
                hasPoll = true;
                result[i - 1] = PollListStruct(
                    bytes32(i),
                    poll[bytes32(i)].metadata,
                    poll[bytes32(i)].q,
                    poll[bytes32(i)].choices,
                    poll[bytes32(i)].start,
                    poll[bytes32(i)].end,
                    poll[bytes32(i)].whitelist,
                    poll[bytes32(i)].limitPerAccount,
                    poll[bytes32(i)].amount,
                    poll[bytes32(i)].manager,
                    poll[bytes32(i)].pause,
                    poll[bytes32(i)].dt,
                    poll[bytes32(i)].respondCounter
                );
            }
        }

        return (result, hasPoll);
    }

    ///@notice Get poll
    function getPoll(bytes32 _pollId) public view returns (PollStruct memory) {
        return poll[_pollId];
    }

    ///@notice Get list by address
    function pollAccountList(address _manager) public view returns (bytes32[] memory) {
        return pollAccount[_manager];
    }

    ///@notice Get respond list
    function responseList(bytes32 _pollId) public view returns (RespondListStruct[] memory list) {
        uint256 totalResponse = poll[_pollId].respondCounter;
        RespondListStruct[] memory result = new RespondListStruct[](totalResponse);

        for (uint256 i = 1; i <= totalResponse; i++) {
            if (respond[bytes32(i)].pollId == _pollId) {
                result[i - 1] = RespondListStruct({
                    respondId: bytes32(i),
                    pollId: respond[bytes32(i)].pollId,
                    metadata: respond[bytes32(i)].metadata,
                    choice: respond[bytes32(i)].choice,
                    sender: respond[bytes32(i)].sender,
                    dt: respond[bytes32(i)].dt
                });
            }
        }

        return result;
    }

    ///@notice Withdraw LSP7 token
    function withdrawLSP7(
        address _LSP7Token,
        address _to,
        uint256 _amount,
        bool _force,
        bytes memory _data
    ) public onlyOwner {
        ILSP7(_LSP7Token).transfer(address(this), _to, _amount, _force, _data);
    }

    ///@notice Withdraw the balance from this contract and transfer it to the owner's address
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Failed");
    }

    ///@notice Transfer balance from this contract to input address
    function transferBalance(address payable _to, uint256 _amount) public onlyOwner {
        // Note that "to" is declared as payable
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed");
    }

    /// @notice Return the balance of this contract
    function getLSP7Balance(address _token) public view returns (uint256) {
        return ILSP7(_token).balanceOf(address(this));
    }

    /// @notice Return the balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Pause
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpause
    function unpause() public onlyOwner {
        _unpause();
    }

    function getNow() public view returns (uint256) {
        return block.timestamp;
    }
}
