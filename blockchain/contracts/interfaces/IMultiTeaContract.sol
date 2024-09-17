//SPDX-License-Identifier: Chai

pragma solidity ^0.8.24;

interface IMultiTeaContract {
    function _mintTeaToken(
        address _account,
        uint256 _tokenId,
        uint256 _amount
    ) external returns (uint256, string memory);

    function _transferTeaToken(
        address _from,
        address _to,
        uint256 _id,
        uint256 _amount
    ) external returns (uint256, string memory);

    function _balanceOfTeaToken(
        address _address,
        uint256 _id
    ) external view returns (uint256);

    function _balanceOfBatchTeaToken(
        address[] memory _accounts,
        uint256[] memory _ids
    ) external view returns (uint256[] memory);

    function _destroyTeaToken(
        address _account,
        uint256 _tokenId,
        uint256 _quantity
    ) external returns (uint256, string memory);
    
}
