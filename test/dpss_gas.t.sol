// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {Test, console} from "forge-std/Test.sol";
import {SecureIPFSStorage} from "../src/dpss_gas.sol";

contract SecureIPFSStorage_gas_Test is Test {
    SecureIPFSStorage public sipfss;

    function setUp() public {
        sipfss = new SecureIPFSStorage();
        sipfss.storeDocument("1111111111111111111111111111111111111111111111","sample1");
    }
    function test_storeDocument() public {
        sipfss.storeDocument("1111111111111111111111111111111111111111111111","sample1");
    }
    function test_deleteDocument() public {
        sipfss.deleteDocument(0);
    }
    function test_getDocumentCount() public view {
        sipfss.getDocumentCount();
        assertEq(sipfss.getDocumentCount(),1);
    }
    function test_getDocument() public view {
        sipfss.getDocument(0);
    }
}