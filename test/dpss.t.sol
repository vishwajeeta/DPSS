// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {Test, console} from "forge-std/Test.sol";
import {SecureIPFSStorage} from "../src/dpss.sol";

contract SecureIPFSStorageTest is Test {
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
    function test_getDocumentCount() public {
        sipfss.getDocumentCount();
        assertEq(sipfss.getDocumentCount(),1);
    }
    function test_getDocument() public {
        sipfss.getDocument(0);
    }
}