// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

contract SimpleStorage {
    uint256 private data;

    event DataUpdated(uint256 oldValue, uint256 newValue);

    function set(uint256 _data) external {
        uint256 old = data;
        data = _data;
        emit DataUpdated(old, _data);
    }

    function get() external view returns (uint256) {
        return data;
    }
}
