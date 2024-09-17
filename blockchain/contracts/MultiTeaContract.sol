//SPDX-License-Identifier: Chai

pragma solidity ^0.8.24;

import "./contracts-upgradeable/proxy/utils/Initializable.sol";
import "./contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "./interfaces/IMultiTeaContract.sol";

contract MultiTeaContract is
    Initializable,
    IMultiTeaContract,
    ERC1155Upgradeable
{
    //Please do not disturb the sequence of Variables/Constants
    address public implementationAdd;
    address public admin;
    string private constant NOT_AUTHORIZED = "Not Authorized User";

    mapping(uint256 => mapping(address => uint256)) private _balances;

    uint256 private constant ERROR_CODE = 50;
    string private constant ERROR_MESSAGE = "Transfer Failure";

    uint256 private constant SUCCESS_CODE = 51;
    string private constant SUCCESS_MESSAGE = "Transfer Success";

    string private constant TXN_STATUS_SUCCESS = "SUCCESS";
    string private constant TXN_STATUS_FAILURE = "FAILURE";

    string private constant TXN_TYPE_TRANSFER_TEA_TOKENS = "TEA TOKENS TRANSFER";
    string private constant TXN_TYPE_MINT_TEA_TOKENS = "TEA TOKENS MINT";
    string private constant TXN_TYPE_BURN_TEA_TOKENS = "TEA TOKENS BURN";

    string private constant ERROR_MSG_1 = "No value should not be Zero.";
    string private constant ERR_MSG_ADDRESS_ZERO = "ERC1155: address zero is not a valid address";
    string private constant ERR_MSG_INSUFFICIENT_BALANCE = "ERC1155: insufficient balance for transfer";
    string private constant ERR_MSG_ADDRESS_MISMATCH = "ERC1155: accounts and ids length mismatch";
    

    event TransferTeaTkn(string txnType, string txnStatus, address senderId, address receiverId, uint256 quantity, uint txnDate);
    event MintTeaTkn(string txnType, string txnStatus, address senderId, address receiverId, uint256 quantity, uint txnDate);

    //Add new Variables/Constants from here

    constructor() {
    }

    ////////// INITIALIZE / CALLING CONSTRUCTOR ///////
    /**
     * Only one time user can call this function
     * and initialize values, which are required
     */
    function _initialize() external {
        __ERC1155_init("");
    }

    //////////////////////////////// MINTING TEA TOKEN /////////////////////////////
    /**
     * Only owner can mint tea token. For that User has to provide
     * own account address ,tokenId, number of tokens/quantity and data
     * If yon need to store any data then pass it otherwise send empty string
     * according to result responseCode and responseMessage
     * value will be return in the response
     */
    function _mintTeaToken(
        address _account,
        uint256 _tokenId,
        uint256 _quantity
    ) external returns (uint256, string memory) {
        require(_account != address(0) && _quantity > 0 && _tokenId > 0, ERROR_MSG_1);
        _mint(_account, _tokenId, _quantity, "");
        return
            emitEvents(true, TXN_TYPE_MINT_TEA_TOKENS, msg.sender, _account, _quantity, block.timestamp);
    }

    ////////////////////////// TRANSFERING TEA TOKEN ////////////////////////////
    /**
     * To transfer tea token, User has to provide
     * address of receiver and number of tokens
     * according to result responseCode and responseMessage
     * value will be return in the response
     */
    function _transferTeaToken(
        address _from,
        address _to,
        uint256 _id,
        uint256 _quantity
    ) external returns (uint256, string memory) {
        require(_from != address(0) && _to != address(0) && _id > 0 && _quantity > 0, ERROR_MSG_1);
        _safeTransferFrom(_from, _to, _id, _quantity, "");
        return
            emitEvents(true, TXN_TYPE_TRANSFER_TEA_TOKENS, msg.sender, _to, _quantity, block.timestamp);
    }

    //////////////////////// GET BALANCE ///////////////////////////
    /**
     * To get balance, User has to provide
     * address of account, for which he would like to get detail
     * available teaToken balance  will be return in the response
     */
    function _balanceOfTeaToken(
        address _address,
        uint256 _id
    ) external view returns (uint256) {
        require(_address != address(0) && _id > 0, ERROR_MSG_1);
        return balanceOf(_address, _id);
    }

     //////////////////////////////////////////// GET BALANCE OF BATCH /////////////////////////////////////
    /**
     * To get balance of batch, User has to provide 
     * address of accounts,and token _ids for which he would like to get detail
     * available teaToken balance  will be return in the response
     */
    function _balanceOfBatchTeaToken(address[] memory _accounts, uint256[] memory _ids)
       external view
        returns (uint256[] memory)
    {
        require(_accounts.length == _ids.length ,ERR_MSG_ADDRESS_ZERO);
        uint256[] memory batchBalances = balanceOfBatch(_accounts,_ids);
        return batchBalances;
    }

    //////////////////////////////// MINT //////////////////////////
    /**
     * Overriding the exisitng method of ERC1155Upgradeable
     */
    function _mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) override internal virtual {
        require(to != address(0), ERR_MSG_ADDRESS_ZERO);
        address operator = _msgSender();
        uint256[] memory ids = _asSingletonArrays(id);
        uint256[] memory amounts = _asSingletonArrays(amount);
        _beforeTokenTransfer(operator, address(0), to, ids, amounts, data);
        _balances[id][to] += amount;
        emit TransferSingle(operator, address(0), to, id, amount);
    }

    //////////////////////////// SAFE TRANSFER FROM /////////////////////////
    /**
     * Overriding the existing method of ERC1155Upgradeable
     */
    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual override(ERC1155Upgradeable) {
        require(to != address(0), ERR_MSG_ADDRESS_ZERO);
        address operator = _msgSender();
        uint256[] memory ids = _asSingletonArrays(id);
        uint256[] memory amounts = _asSingletonArrays(amount);
        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount,ERR_MSG_INSUFFICIENT_BALANCE);
        unchecked {
            _balances[id][from] = fromBalance - amount;
        }
        _balances[id][to] += amount;
        emit TransferSingle(operator, from, to, id, amount);
    }

    //////////////////////////////////////////// BALANCE OF /////////////////////////////////////
    /**
     * Overriding the existing method of ERC1155Upgradeable
     */
    function balanceOf(
        address account,
        uint256 id
    ) public view virtual override returns (uint256) {
        require(account != address(0), ERR_MSG_ADDRESS_ZERO);
        return _balances[id][account];
    }

    /**
     *
     * Overriding the existing method of ERC1155Upgradeable
     */
    function balanceOfBatch(address[] memory accounts, uint256[] memory ids)
        public
        view
        virtual
        override
        returns (uint256[] memory)
    {
        require(accounts.length == ids.length, ERR_MSG_ADDRESS_MISMATCH);

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }


    //////////////////////////////// BURN TEA TOKEN /////////////////////////////
    /**
     * Who own the token can burn. For that User has to provide
     * own account address ,tokenId, number of tokens/quantity and data
     * according to result responseCode and responseMessage
     * value will be return in the response
     */
    function _destroyTeaToken(
        address _account,
        uint256 _tokenId,
        uint256 _quantity
    ) external returns (uint256, string memory) {
        require(_account != address(0) && _quantity > 0 && _tokenId > 0, ERROR_MSG_1);
        _burn(_account, _tokenId, _quantity);
        return
            emitEvents(true, TXN_TYPE_MINT_TEA_TOKENS, msg.sender, _account, _quantity, block.timestamp);
    }   

    ///////////////////////////////////// As Singleton Arrays //////////////////////////
    function _asSingletonArrays(
        uint256 element
    ) private pure returns (uint256[] memory) {
        uint256[] memory array = new uint256[](1);
        array[0] = element;
        return array;
    }

    ////////////////////////////// EMIT EVENTS /////////////////////////////
    /**
     * This function will emit the event and
     * return responseCode and responseMessage
     * as per the success/failure
     */
    function emitEvents(
        bool _result,
        string memory _txnType,
        address _senderId,
        address _receiverId,
        uint256 _quantity,
        uint _txnDate
    ) internal returns (uint256, string memory) {
        if (_result) {
            emitEventsAsResult(TXN_STATUS_SUCCESS, _txnType, _senderId, _receiverId, _quantity, _txnDate);
            return (SUCCESS_CODE, SUCCESS_MESSAGE);
        } else {
            emitEventsAsResult(TXN_STATUS_FAILURE, _txnType, _senderId, _receiverId, _quantity, _txnDate);
            return (ERROR_CODE, ERROR_MESSAGE);
        }
    }

    /////////////////////////// EMIT EVENTS AS RESULT ///////////////////
    /**
     * This function will emit the event
     * as per the success/failure
     */
    function emitEventsAsResult(
        string memory _txnStatus,
        string memory _txnType,
        address _senderId,
        address _receiverId,
        uint256 _quantity,
        uint _txnDate
    ) internal {
        if (compareTwoString(_txnType, TXN_TYPE_MINT_TEA_TOKENS)) {
            emit MintTeaTkn(_txnType, _txnStatus, _senderId, _receiverId, _quantity, _txnDate);
        } else if (compareTwoString(_txnType, TXN_TYPE_TRANSFER_TEA_TOKENS)) {
            emit TransferTeaTkn(_txnType, _txnStatus, _senderId, _receiverId, _quantity, _txnDate);
        }
    }

    //////////////////////////////////// COMPARE TWO STRING ////////////////////////////
    /**
     * Comparing Two Strings, whether they are equal or not
     * If equal returns TRUE else returns FALSE
     */
    function compareTwoString(
        string memory str1,
        string memory str2
    ) internal pure returns (bool) {
        if (keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2))) {
            return true;
        }
        return false;
    }
}
