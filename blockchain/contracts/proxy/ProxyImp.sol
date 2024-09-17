//SPDX-License-Identifier: Chai
pragma solidity ^0.8.24;
import "../contracts-upgradeable/proxy/utils/Initializable.sol";


contract ProxyImp is Initializable {
  address private implementationAdd; 
  address private admin; 
  string private constant NOT_AUTHORIZED = "Not Authorized User";
  string private constant ERROR_MSG_1 = "Account Number should not be empty";

  constructor() {
    admin = msg.sender;
  }

  function _delegate(address _implementation) internal {
    require(_implementation != address(0),ERROR_MSG_1);
    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize())
      let result := delegatecall(gas(), _implementation, ptr, calldatasize(), 0, 0)
      returndatacopy(0, 0, returndatasize())
      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }


  modifier OnlyAdmin() {
      require(msg.sender == admin, NOT_AUTHORIZED);
      _;
  }

  fallback() external payable {
    _delegate(implementationAdd);
  }

  function implementation() external view returns (address) {
    return implementationAdd;
  }

  function setImplementation(address _implementation) external OnlyAdmin() {
    implementationAdd = _implementation;
  }
}
