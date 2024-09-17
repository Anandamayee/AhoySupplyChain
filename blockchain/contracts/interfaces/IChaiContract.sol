//SPDX-License-Identifier: Chai

pragma solidity ^0.8.24;

interface IChaiContract {
    function registerTeaTokenPlayers(
        string memory _fullName,
        string memory _firmName,
        string memory _address,
        string memory _mobileNumber,
        string memory _gstNumber,
        string memory _role
    ) external returns (uint256, string memory);

    function getRegisteredTeaTokenPlayerDetail(
        string memory _gstNumber
    )
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        );

    function harvestByFarmer(
        string memory _harvestId,
        string memory _gstNumber,
        string memory _firmName,
        string memory _location,
        string memory _harvestDateTime,
        string memory _teaTokenType,
        uint256 _quantity,
        string memory _quality
    ) external returns (uint256, string memory);

    function getHarvestDetail(
        string memory _harvestId
    )
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            string memory
        );

    function batchingHarvestByprocessor(
        string[] memory _harvestIds,
        uint256 _quantity,
        string memory _quality,
        string memory _batchId,
        string memory _processorGSTNumber
    ) external returns (uint256, string memory);

    function teaTokenTrackingByTransporter(
        string memory _batchId,
        string[] memory _storageDetail,
        string[] memory _shipingDetail
    ) external returns (uint256, string memory);

    function teaTokenTrackingHistoryFechByConsumer(
        string memory _batchId
    )
        external
        view
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
        );

    function teaPlacedInShelvesByRetailer(
        string memory _batchId
    ) external returns (uint256, string memory);

    function ACupOfTeaReady(
        string memory _teaType,
        uint256 _quantity
    ) external returns (uint256, string memory);

    function getBatchDetails(
        string memory _batchId
    ) external view returns (string[] memory,uint256,string memory,string memory,address,uint256,string memory);

    function getShippingDetail(
        string memory _batchId
    ) external returns (string memory,string memory,string[] memory,string[] memory);
}
