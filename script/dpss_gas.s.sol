// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import {Script} from "forge-std/Script.sol";
import {SecureIPFSStorage} from "../src/dpss_gas.sol";
contract DeploySecureIPFSStorage is Script {
    function run()external {
        vm.startBroadcast();
        new SecureIPFSStorage();
        vm.stopBroadcast();
    }
}