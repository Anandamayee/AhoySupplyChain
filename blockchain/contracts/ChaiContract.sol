//SPDX-License-Identifier: Chai

pragma solidity ^0.8.24;

import "./contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IChaiContract.sol";
import "./contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./utils/ReentrancyGuard.sol";

contract ChaiContract is Initializable, IChaiContract, OwnableUpgradeable, ReentrancyGuard  {
    //Please do not disturb the sequence of Variables/Constants
    address public implementationAdd;
    string private constant NOT_AUTHORIZED = "Not Authorized User";

    string private constant ERROR_MSG_1 = "No value should be empty or zero";
    string private constant ERROR_MSG_2 = "Account Number should not be empty";
    string private constant ERROR_MSG_3 = "GST Number should not be empty";
    string private constant ERROR_MSG_4 = "Token does not exist";

    string private constant TXN_STATUS_SUCCESS = "SUCCESS";
    string private constant TXN_STATUS_FAILURE = "FAILURE";

    string private constant TXN_TYPE_TOKEN_MINT = "TOKEN MINTED SUCCESSFULLY";
    string private constant TXN_TYPE_USER_REGISTERED = "USER REGISTERED";
    string private constant TXN_TYPE_TEA_HARVESTED = "TEA HARVESTED";
    string private constant TXN_TYPE_TEA_PROCESSED = "TEA PROCESSED";
    string private constant TXN_TYPE_TEA_TRANSPORTED = "TEA TRANSPORTED";
    string private constant TXN_TYPE_TEA_DELIEVERED = "TEA DELIEVERED";
    string private constant TXN_TYPE_CUP_OF_TEA_READY = "CUP OF TEA READY"; //BURN

    uint256 private constant ERROR_CODE = 50;
    string private constant ERROR_MESSAGE = "Transfer Failure";

    uint256 private constant SUCCESS_CODE = 51;
    string private constant SUCCESS_MESSAGE = "Transfer Success";

    string private constant FARMER = "Farmer";
    string private constant PROCESSOR = "Processor";
    string private constant TRANSPORTER = "Transporter";
    string private constant RETAILER = "Retailer";
    
    mapping(string => bool) private tokenExists;
    uint256 private teaTokenId = 0;

    address private proxyMultiTeaContractAdd;

    struct TeaTokenConfig {
        uint256 id;
        string teaTokenType; //Brand of Tea like Assam
    }

    mapping(string => TeaTokenConfig) private teaTokenConfiguration;

    struct UserRegistration {
        address account;
        string fullName;
        string firmName;
        string ownerAddress;
        string mobileNumber;
        string gstNumber;
        string role;
    }

    mapping(string => UserRegistration) private userGSTMap;
    mapping(address => UserRegistration) private userMap;

    struct HarvestDetail {
        uint256 teaTokenId;
        string harvestId;
        string location;
        string harvestDateTime;
        string teaType;
        uint256 quantity;
        string quality;
        address farmerId;
    }

    // Harvest Map
    mapping(string => HarvestDetail) private teaHarvestMap;

    struct BatchDetail {
        string[] harvestIds;
        uint256 quantity;
        string quality;
        string batchId;
        address batchOwner;
        uint256 teaTokenId;
        string gstNoOfProcessor;
    }

    mapping(string => BatchDetail) private batchDetailMap;

    struct TransportTrackingDetail {
        string batchId;
        string harvestId;
        string[] storageDetail;
        string[] shipingDetail;
    }

    mapping(string => TransportTrackingDetail)
        private transportTrackingDetailMap;

    enum TeaTokenType {
        ApsaraTea
    }

    enum UserRole {
        Farmer,
        Processor,
        Retailer,
        Transporter
    }

    event TeaTokenPlayerRegistration(
        string txnType,
        string txnStatus,
        uint256 quantity,
        uint txnDate
    );
    event TeaHarvested(
        string txnType,
        string txnStatus,
        uint256 quantity,
        uint txnDate
    );
    event TeaProcessed(
        string txnType,
        string txnStatus,
        uint256 quantity,
        uint txnDate
    );
    event TeaTransported(
        string txnType,
        string txnStatus,
        uint256 quantity,
        uint txnDate
    );
    event TeaDelievered(
        string txnType,
        string txnStatus,
        uint256 quantity,
        uint txnDate
    );
    event CupOfTeaReady(
        string txnType,
        string txnStatus,
        uint256 quantity,
        uint txnDate
    );

    //Add new Variables/Constants from above of this line

    constructor() {
    }

    ////////// INITIALIZE / CALLING CONSTRUCTOR ///////
    /**
     * Only one time user can call this function
     * and initialize values, which are required
     */
    function _initialize(address _proxyMultiTeaContractAdd) external {
        proxyMultiTeaContractAdd = _proxyMultiTeaContractAdd;
        __Ownable_init(msg.sender);
    }

    ////////////////////////////// MODIFIERS /////////////////////////////
    modifier OnlyFarmer() {
        string memory _role = userMap[msg.sender].role;
        require(
            keccak256(bytes(_role)) == keccak256(bytes(FARMER)),
            NOT_AUTHORIZED
        );
        _;
    }

    modifier OnlyProcessor() {
        string memory _role = userMap[msg.sender].role;
        require(
            keccak256(bytes(_role)) == keccak256(bytes(PROCESSOR)),
            NOT_AUTHORIZED
        );
        _;
    }

    modifier OnlyTransporter() {
        string memory _role = userMap[msg.sender].role;
        require(
            keccak256(bytes(_role)) == keccak256(bytes(TRANSPORTER)),
            NOT_AUTHORIZED
        );
        _;
    }

    modifier OnlyRetailer() {
        string memory _role = userMap[msg.sender].role;
        require(
            keccak256(bytes(_role)) == keccak256(bytes(RETAILER)),
            NOT_AUTHORIZED
        );
        _;
    }


    modifier OnlyConsumer() {
        string memory _role = userMap[msg.sender].role;
        require(
            keccak256(bytes(_role)) != keccak256(bytes(FARMER)) && 
            keccak256(bytes(_role)) != keccak256(bytes(PROCESSOR)) &&
            keccak256(bytes(_role)) != keccak256(bytes(TRANSPORTER)) &&
            keccak256(bytes(_role)) != keccak256(bytes(RETAILER)),
            NOT_AUTHORIZED
        );
        _;
    }
    //////////////////////////////  //////////////////////////////   //////////////////////////////

    ////////////////////////////// REGISTER TEA TOKEN PLAYERS /////////////////////////////
    /**
     * Register Tea token players with information
     * provided by them during registration
     * and returning success response
     */
    function registerTeaTokenPlayers(
        string memory _fullName,
        string memory _firmName,
        string memory _address,
        string memory _mobileNumber,
        string memory _gstNumber,
        string memory _role
    ) external returns (uint256, string memory) {
        require(
                bytes(_fullName).length > 0 &&
                bytes(_firmName).length > 0 &&
                bytes(_address).length > 0 &&
                bytes(_mobileNumber).length > 0 &&
                bytes(_gstNumber).length > 0 &&
                bytes(_role).length > 0 ,
            ERROR_MSG_1
        );
        userMap[msg.sender] = UserRegistration(
            msg.sender,
            _fullName,
            _firmName,
            _address,
            _mobileNumber,
            _gstNumber,
            _role
        );
        userGSTMap[_gstNumber] = UserRegistration(
            msg.sender,
            _fullName,
            _firmName,
            _address,
            _mobileNumber,
            _gstNumber,
            _role
        );
        return
            _emitEvent(
                true,
                TXN_TYPE_USER_REGISTERED,
                msg.sender,
                msg.sender,
                0,
                block.timestamp
            );
    }

    /////////////////////// ADMIN OPERATIONS  ///////////////////////////
    /**
     * only admin can mint the token
     */
    function mintTokenAdmin(
        uint256 _quantity,
        string memory _teaTokenType
    ) external onlyOwner nonReentrant returns(uint256, string memory){
        if (!tokenExists[_teaTokenType]) {
            teaTokenId = teaTokenId + 1;
            tokenExists[_teaTokenType] = true;
            teaTokenConfiguration[_teaTokenType] = TeaTokenConfig(
                teaTokenId,
                _teaTokenType
            );
            (bool result, ) = proxyMultiTeaContractAdd.call(
                abi.encodeWithSignature(
                    "_mintTeaToken(address,uint256,uint256)",
                    address(this),
                    teaTokenId,
                    _quantity
                )
            );
        }
        return
            _emitEvent(
                true,
                TXN_TYPE_TOKEN_MINT,
                address(this),
                msg.sender,
                _quantity,
                block.timestamp
            );
    }

    ////////////////////////////// HARVEST TEA TOKEN BY FARMER /////////////////////////////
    /**
     * Farmer will enter harvest detail related to tea leaves
     * and will mint teaToken on behalf of it
     * For that required parameters in the request are
     * harvestId, location, harvestDateTime, type, quantity and quality
     * According to result responseCode and responseMessage,
     * value will be return in the response
     */

    function harvestByFarmer(
        string memory _harvestId,
        string memory _gstNumber,
        string memory _firmName,
        string memory _location,
        string memory _harvestDateTime,
        string memory _teaTokenType,
        uint256 _quantity,
        string memory _quality
    ) external OnlyFarmer returns (uint256, string memory) {
        require(
            bytes(_harvestId).length > 0 &&
                bytes(_gstNumber).length > 0 &&
                bytes(_firmName).length > 0 &&
                bytes(_location).length > 0 &&
                bytes(_harvestDateTime).length > 0 &&
                bytes(_teaTokenType).length > 0 &&
                _quantity > 0 &&
                bytes(_quality).length > 0,
            ERROR_MSG_1
        );
        uint256 _teaTokenId = _is_token_exist(_teaTokenType);
        require(teaTokenId > 0, ERROR_MSG_4);
        teaHarvestMap[_harvestId] = HarvestDetail(
            _teaTokenId,
            _harvestId,
            _location,
            _harvestDateTime,
            _teaTokenType,
            _quantity,
            _quality,
            msg.sender
        );
        transferSingleOwnership(
            _quantity,
            _teaTokenId,
            msg.sender,
            address(this)
        );
        return
            _emitEvent(
                true,
                TXN_TYPE_TEA_HARVESTED,
                address(this),
                msg.sender,
                _quantity,
                block.timestamp
            );
    }

    ////////////////////////////// PACKAGING TEA TOKEN BY PROCESSOR /////////////////////////////
    /**
     * Processor will perform all packaging process like
     * withering, rolling, fermenting, drying, and sorting...
     * Once sorting done, batched tea leaves are processing one by one
     * On behalf of it BatchId will generate and
     * ownership will get transffered to Processor to proceed further
     * For that required parameters in the request are
     * harvestId, quantity, quality, gstNumberOfProcessor, batchId
     * According to result responseCode and responseMessage,
     * value will be return in the response
     */
    function batchingHarvestByprocessor(
        string[] memory _harvestIds,
        uint256 _quantity,
        string memory _quality,
        string memory _batchId,
        string memory _processorGSTNumber
    ) external OnlyProcessor returns (uint256, string memory) {
        require(
            _harvestIds.length > 0 &&
                _quantity > 0 &&
                bytes(_quality).length > 0 &&
                bytes(_batchId).length > 0 ,
            ERROR_MSG_1
        );

        // check available balance of each harvest
        uint256[] memory _ids;
        uint256[] memory _amounts;
        address[] memory _senders;
        for (uint8 i = 0; i < _harvestIds.length; i++) {
            _ids[i] = teaHarvestMap[_harvestIds[i]].teaTokenId;
            _amounts[i] = teaHarvestMap[_harvestIds[i]].quantity;
            _senders[i] = teaHarvestMap[_harvestIds[i]].farmerId;
        }
        uint256 _teaTokenId = _ids[0];
        batchDetailMap[_batchId] = BatchDetail(
            _harvestIds,
            _quantity,
            _quality,
            _batchId,
            msg.sender,
            _teaTokenId,
            _processorGSTNumber
        );
        transferMultiTokenSingleOwnership(
            _quantity,
            _amounts,
            _ids,
            _senders,
            msg.sender
        );
        return
            _emitEvent(
                true,
                TXN_TYPE_TEA_PROCESSED,
                msg.sender,
                _senders[0],
                _quantity,
                block.timestamp
            );
    }

    ////////////////////////////// TEA TOKEN TRACKING BY TRANSPORTER /////////////////////////////
    /**
     * Transporter will maintain the storage and shipping process
     * and will share all detail like
     * Storage Detail - batchId, humidity, temperature, date/time
     * Shipping Detail - batchId, sender, carrier, departureDate, expectedArrivalDate, receiver
     * For that required parameters in the request are
     * batchId,
     * According to result responseCode and responseMessage,
     * value will be return in the response
     */
    function teaTokenTrackingByTransporter(
        string memory _batchId,
        string[] memory _storageDetail,
        string[] memory _shipingDetail
    ) external OnlyTransporter returns (uint256, string memory) {
        transportTrackingDetailMap[_batchId] = TransportTrackingDetail(
            _batchId,
            "",
            _storageDetail,
            _shipingDetail
        );
        return
            _emitEvent(
                true,
                TXN_TYPE_TEA_TRANSPORTED,
                msg.sender,
                msg.sender,
                0,
                block.timestamp
            );
    }

    ////////////////////////////// TEA TOKEN TRACKING HISTORY FETCH BY CONSUMER /////////////////////////////
    /**
     * Transporter will maintain the storage and shipping process
     * and will share all detail like
     * Storage Detail - batchId, humidity, temperature, date/time
     * Shipping Detail - batchId, sender, carrier, departureDate, expectedArrivalDate, receiver
     * For that required parameters in the request are
     * batchId,
     * According to result responseCode and responseMessage,
     * value will be return in the response
     */
    function teaTokenTrackingHistoryFechByConsumer(
        string memory _batchId
    )
        external
        view
        OnlyRetailer
        returns (
            string memory,
            string[] memory,
            string[] memory,
            string memory,
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        //Fetch Overall Transporter Tracking Detail
        TransportTrackingDetail
            memory _transportTrackingDtl = getTransportTrackingDetailBasisOfBatchId(
                _batchId
            );
        string memory _harvestId = _transportTrackingDtl.harvestId;
        string[] memory _storageDetail = _transportTrackingDtl.storageDetail;
        string[] memory _shippingDetail = _transportTrackingDtl.shipingDetail;

        //Fetch Overall Processor Detail
        BatchDetail memory _batchDetail = getProcessorDetailBasisOfBatchId(
            _batchId
        );
        string memory _processorGSTNumber = _batchDetail.gstNoOfProcessor;
        uint256 _quantity = _batchDetail.quantity;
        string memory _quality = _batchDetail.quality;
        UserRegistration
            memory _userRegistrationDtlAsGST = getRegisteredTeaTokenPlayerDetailBasisOfGST(
                _processorGSTNumber
            );
        // string memory _processorFullName = _userRegistrationDtlAsGST.fullName;
        string memory _processorFirmName = _userRegistrationDtlAsGST.firmName;

        //Fetch Harvest Detail
        HarvestDetail memory _harvestDtl = getHarvestDetailBasisOfHarvestId(
            _harvestId
        );
        // uint256 _hrvestedTeaTokenId = _harvestDtl.teaTokenId;
        // string memory _harvestedTeaLocation = _harvestDtl.location;
        string memory _harvestDateTime = _harvestDtl.harvestDateTime;
        string memory _harvestedTeaType = _harvestDtl.teaType;
        address _farmerId = _harvestDtl.farmerId;

        //Fetch Farmer Detail
        UserRegistration
            memory userRegistrationDtl = getRegisteredTeaTokenPlayerDetailBasisOfAcc(
                _farmerId
            );
        // string memory _farmerFullName = userRegistrationDtl.fullName;
        string memory _farmerFirmName = userRegistrationDtl.firmName;
        string memory _farmerGSTNumber = userRegistrationDtl.gstNumber;

        return (
            _batchId,
            _storageDetail,
            _shippingDetail,
            _quality,
            _quantity,
            _processorFirmName,
            _processorGSTNumber,
            _harvestDateTime,
            _harvestedTeaType,
            _farmerFirmName,
            _farmerGSTNumber
        );
    }

    ////////////////////////////// TEA PLACED IN SHELVES BY RETAILER /////////////////////////////
    /**
     * Once Retailer will recive the package
     * and will share batchId in the request,
     * Then that particular token get transferred to him
     * According to result responseCode and responseMessage,
     * value will be return in the response
     */
    function teaPlacedInShelvesByRetailer(
        string memory _batchId
    ) external OnlyRetailer returns (uint256, string memory) {
        BatchDetail memory _batchDetail = getProcessorDetailBasisOfBatchId(
            _batchId
        );
        string memory _processorGSTNumber = _batchDetail.gstNoOfProcessor;
        uint256 _quantity = _batchDetail.quantity;

        UserRegistration
            memory _userRegistrationDtlAsGST = getRegisteredTeaTokenPlayerDetailBasisOfGST(
                _processorGSTNumber
            );
        address _processorAccAddress = _userRegistrationDtlAsGST.account;

        TransportTrackingDetail
            memory _transportTrackingDtl = getTransportTrackingDetailBasisOfBatchId(
                _batchId
            );
        string memory _harvestId = _transportTrackingDtl.harvestId;

        HarvestDetail memory _harvestDtl = getHarvestDetailBasisOfHarvestId(
            _harvestId
        );
        uint256 _teaTokenId = _harvestDtl.teaTokenId;

        transferSingleOwnership(
            _quantity,
            _teaTokenId,
            _processorAccAddress,
            msg.sender
        );

        return
            _emitEvent(
                true,
                TXN_TYPE_TEA_DELIEVERED,
                _processorAccAddress,
                msg.sender,
                _quantity,
                block.timestamp
            );
    }

    ////////////////////////////// A CUP OF TEA READY /////////////////////////////
    /**
     * Once Retailer will sell the tea
     * as per quantity, he will burn it
     * According to result responseCode and responseMessage,
     * value will be return in the response
     */
    function ACupOfTeaReady(
        string memory _teaType,
        uint256 _quantity
    ) external OnlyRetailer returns (uint256, string memory) {
        require(tokenExists[_teaType], ERROR_MSG_4);
        uint256 _teaTknId = _is_token_exist(_teaType);
        (, bytes memory data) = proxyMultiTeaContractAdd.call(
            abi.encodeWithSignature(
                "_balanceOfTeaToken(address,uint256)",
                msg.sender,
                _teaTknId
            )
        );
        uint256 balanceRemaining = abi.decode(data, (uint256));
        if (balanceRemaining >= _quantity) {
            (bool result, ) = proxyMultiTeaContractAdd.call(
                abi.encodeWithSignature(
                    "_destroyTeaToken(address,uint256,uint256)",
                    msg.sender,
                    _teaTknId,
                    _quantity
                )
            );
        }
        return
            _emitEvent(
                true,
                TXN_TYPE_CUP_OF_TEA_READY, // Just For Fun...
                msg.sender,
                msg.sender,
                _quantity,
                block.timestamp
            );
    }

    /////////////////////// TRANSFER SINGLE OWNERSHIP  ///////////////////////////
    /**
     * transfer ownership Single
     */
    function transferSingleOwnership(
        uint256 _quantity,
        uint256 _teaTokenId,
        address _sender,
        address _receiver
    ) internal returns (uint256) {
        (, bytes memory data) = proxyMultiTeaContractAdd.call(
            abi.encodeWithSignature(
                "_balanceOfTeaToken(address,uint256)",
                _sender,
                _teaTokenId
            )
        );
        uint256 balanceRemaining = abi.decode(data, (uint256));
        if (balanceRemaining >= _quantity) {
            (bool result, ) = proxyMultiTeaContractAdd.call(
                abi.encodeWithSignature(
                    "_transferTeaToken(address,address,uint256,uint256)",
                    _sender,
                    _receiver,
                    _teaTokenId,
                    _quantity
                )
            );
        }
        return teaTokenId;
    }

    /////////////////////// TRANSFER MULTI TOKEN SINGLE OWNERSHIP  ///////////////////////////
    /**
     * transfer  Multi token single ownership
     */
    function transferMultiTokenSingleOwnership(
        uint256 _quantity,
        uint256[] memory _quantities,
        uint256[] memory _teaTokenIds,
        address[] memory _senders,
        address _receiver
    ) internal returns (uint256, string memory) {
        (, bytes memory data) = proxyMultiTeaContractAdd.call(
            abi.encodeWithSignature(
                "_balanceOfBatchTeaToken(address[],uint256)",
                _senders,
                _teaTokenIds
            )
        );
        uint256[] memory _balanceRemaining = abi.decode(data, (uint256[]));

        if (sumArray(_balanceRemaining) >= _quantity) {
            for (uint8 i = 0; i < _teaTokenIds.length; i++) {
                (bool result, ) = proxyMultiTeaContractAdd.call(
                    abi.encodeWithSignature(
                        "_transferTeaToken(address,address,uint256,uint256)",
                        _senders[i],
                        _receiver,
                        _teaTokenIds[i],
                        _quantities[i]
                    )
                );
            }
        }
    }


    /////////////////////// GET REGISTERED TEA TOKEN PLAYER DETAIL///////////////////////////
    /**
     * Getting User Specific detail on the basis of GST Number
     */
    function getRegisteredTeaTokenPlayerDetail(
        string memory _gstNumber
    ) external view returns (string memory, string memory, string memory, string memory, 
    string memory, string memory) {
        require(bytes(_gstNumber).length > 0 , ERROR_MSG_3);
        UserRegistration memory userReg = userGSTMap[_gstNumber];
        return (userReg.firmName, userReg.fullName, 
        userReg.gstNumber, userReg.mobileNumber, userReg.ownerAddress, userReg. role);
    }


    /////////////////////// GET HARVEST DETAIL///////////////////////////
    /**
     * Getting Harvest Specific detail on the basis of Harvest ID
     */
    function getHarvestDetail(
        string memory _harvestId
    ) external view returns (string memory, string memory, string memory,
    string memory, uint256, uint256, string memory) {
        require(bytes(_harvestId).length > 0 , ERROR_MSG_3);
        HarvestDetail memory hrvDtl = teaHarvestMap[_harvestId];
        return (hrvDtl.harvestDateTime, hrvDtl.harvestId, hrvDtl.location, hrvDtl.quality, 
        hrvDtl.quantity, hrvDtl.teaTokenId, hrvDtl.teaType);
    }


    /////////////////////// GET BATCH DETAIL///////////////////////////
    /**
     * Getting Batch Specific detail on the basis of Batch ID
     */
    function getBatchDetails(
        string memory _batchId
    ) external view returns (string[] memory,uint256,string memory,string memory,address,uint256,string memory) {
        require(bytes(_batchId).length > 0 , ERROR_MSG_3);
        BatchDetail memory bchDtl = batchDetailMap[_batchId];
        return (bchDtl.harvestIds, bchDtl.quantity, bchDtl.quality, bchDtl.batchId, 
        bchDtl.batchOwner, bchDtl.teaTokenId, bchDtl.gstNoOfProcessor);
    }

    function getShippingDetail(
        string memory _batchId
    ) external view returns (string memory,string memory,string[] memory,string[] memory) {
        require(bytes(_batchId).length > 0 , ERROR_MSG_3);
        TransportTrackingDetail memory tpDtl = transportTrackingDetailMap[_batchId];
        return (tpDtl.batchId, tpDtl.harvestId, tpDtl.shipingDetail, tpDtl.storageDetail);
    }

    /////////////////////// GET REGISTERED TEA TOKEN PLAYER DETAIL BASIS OF ACC ///////////////////////////
    /**
     * Getting User Specific detail on the basis of account number
     */
    function getRegisteredTeaTokenPlayerDetailBasisOfAcc(
        address _account
    ) internal view returns (UserRegistration memory) {
        require(!isAccountNEmpty(_account), ERROR_MSG_2);
        return userMap[_account];
    }

    /////////////////////// GET REGISTERED TEA TOKEN PLAYER DETAIL BASIS OF GST ///////////////////////////
    /**
     * Getting User Specific detail on the basis of GST Number
     */
    function getRegisteredTeaTokenPlayerDetailBasisOfGST(
        string memory _gstNumber
    ) internal view returns (UserRegistration memory) {
        require(bytes(_gstNumber).length > 0 , ERROR_MSG_3);
        return userGSTMap[_gstNumber];
    }

    /////////////////////// GET HARVEST DETAIL BASIS OF HARVEST ID ///////////////////////////
    /**
     * Getting Harvest Specific detail on the basis of Harvest ID
     */
    function getHarvestDetailBasisOfHarvestId(
        string memory _harvestId
    ) internal view returns (HarvestDetail memory) {
        require(bytes(_harvestId).length > 0 , ERROR_MSG_3);
        return teaHarvestMap[_harvestId];
    }

    /////////////////////// GET PROCESSOR DETAIL BASIS OF BATCH ID ///////////////////////////
    /**
     * Getting Processor Specific detail on the basis of BATCH ID
     */
    function getProcessorDetailBasisOfBatchId(
        string memory _batchId
    ) internal view returns (BatchDetail memory) {
        require(bytes(_batchId).length > 0 , ERROR_MSG_3);
        return batchDetailMap[_batchId];
    }

    /////////////////////// GET TRANSPORT TRACKING DETAIL BASIS OF BATCH ID ///////////////////////////
    /**
     * Getting Specific detail on the basis of BATCH ID
     */
    function getTransportTrackingDetailBasisOfBatchId(
        string memory _batchId
    ) internal view returns (TransportTrackingDetail memory) {
        require(bytes(_batchId).length > 0 , ERROR_MSG_3);
        return transportTrackingDetailMap[_batchId];
    }

    /////////////////////////////// IS TOKEN EXIST /////////////////////////////
    /**
     * Checking whether the particular token is exist
     */
    function _is_token_exist(
        string memory _teaTokenType
    ) internal returns (uint256) {
        teaTokenId = teaTokenConfiguration[_teaTokenType].id;
        require(teaTokenId > 0, ERROR_MSG_4);
        return teaTokenId;
    }

    //////////////////////////////////// GET OWNER ADDRESS ////////////////////////////
    /**
     * get current owner's address
     */
    function getOwner() public view returns (address) {
        return owner();
    }

    ////////////////////////////// IS ACCOUNT EMPTY /////////////////////////////
    /**
     * Checking isAccount Number is empty or not
     * If empty then return true;
     */
    function isAccountNEmpty(address _add) internal pure returns (bool) {
        if (_add != address(0)) return false;
        return true;
    }

    //////////////////////////////////// SUM OF ARRAY ////////////////////////////
    /**
     * Comparing Two Strings, whether they are equal or not
     * If equal returns TRUE else returns FALSE
     */
    function sumArray(uint256[] memory array) internal pure returns (uint256) {
        uint sum = 0;
        for (uint i = 0; i < array.length; i++) {
            sum += array[i];
        }
        return sum;
    }

    //////////////////////////////////// COMPARE STRINGS ////////////////////////////
    /**
     * Comparing Two Strings, whether they are equal or not
     * If equal returns TRUE else returns FALSE
     */
    function compareStrings(
        string memory str1,
        string memory str2
    ) internal pure returns (bool) {
        if (
            keccak256(abi.encodePacked(str1)) ==
            keccak256(abi.encodePacked(str2))
        ) {
            return true;
        }
        return false;
    }

    ////////////////////////////// EMIT EVENT /////////////////////////////
    /**
     * This function will emit the event and
     * return responseCode and responseMessage
     * as per the success/failure
     */
    function _emitEvent(
        bool _result,
        string memory _txnType,
        address _senderId,
        address _receiverId,
        uint256 _amount,
        uint _txnDate
    ) internal returns (uint256, string memory) {
        if (_result) {
            _emitEventAsResult(
                TXN_STATUS_SUCCESS,
                _txnType,
                _senderId,
                _receiverId,
                _amount,
                _txnDate
            );
            return (SUCCESS_CODE, SUCCESS_MESSAGE);
        } else {
            _emitEventAsResult(
                TXN_STATUS_FAILURE,
                _txnType,
                _senderId,
                _receiverId,
                _amount,
                _txnDate
            );
            return (ERROR_CODE, ERROR_MESSAGE);
        }
    }

    /////////////////////////// EMIT EVENT AS RESULT ///////////////////
    /**
     * This function will emit the event
     * as per the success/failure
     */
    function _emitEventAsResult(
        string memory _txnStatus,
        string memory _txnType,
        address _senderId,
        address _receiverId,
        uint256 _quantity,
        uint _txnDate
    ) internal {
        if (compareStrings(_txnType, TXN_TYPE_USER_REGISTERED)) {
            emit TeaTokenPlayerRegistration(
                _txnType,
                _txnStatus,
                _quantity,
                _txnDate
            );
        } else if (compareStrings(_txnType, TXN_TYPE_TEA_HARVESTED)) {
            emit TeaHarvested(
                _txnType,
                _txnStatus,
                _quantity,
                _txnDate
            );
        } else if (compareStrings(_txnType, TXN_TYPE_TEA_PROCESSED)) {
            emit TeaProcessed(
                _txnType,
                _txnStatus,
                _quantity,
                _txnDate
            );
        } else if (compareStrings(_txnType, TXN_TYPE_TEA_TRANSPORTED)) {
            emit TeaTransported(
                _txnType,
                _txnStatus,
                _quantity,
                _txnDate
            );
        } else if (compareStrings(_txnType, TXN_TYPE_TEA_DELIEVERED)) {
            emit TeaDelievered(
                _txnType,
                _txnStatus,
                _quantity,
                _txnDate
            );
        } else if (compareStrings(_txnType, TXN_TYPE_CUP_OF_TEA_READY)) {
            emit CupOfTeaReady(
                _txnType,
                _txnStatus,
                _quantity,
                _txnDate
            );
        }
    }
}
