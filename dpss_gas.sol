// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecureIPFSStorage {
    
// Define custom error
error IndexOutOfBounds();
// Define custom errors
error EmptyIPFSHash();
error EmptyTitle();
error InvalidIPFSHashLength();
error StorageLimitReached();
// Define custom error
error InvalidIndex();

    event DocumentStored(address indexed user, string encryptedIpfsHash, string title);
    event DocumentDeleted(address indexed user, uint index);

    struct Document {
        string encryptedIpfsHash; // Stores encrypted IPFS hash
        string title;
    }

    mapping(address => Document[]) private userDocuments;

    uint256 public constant MAX_DOCUMENTS_PER_USER = 50; // Prevent storage spam



function storeDocument(string calldata _encryptedIpfsHash, string calldata _title) external {
    uint256 ipfsLength = bytes(_encryptedIpfsHash).length;

    if (ipfsLength == 0) revert EmptyIPFSHash();
    if (bytes(_title).length == 0) revert EmptyTitle();
    if (ipfsLength != 46) revert InvalidIPFSHashLength();

    Document[] storage docs = userDocuments[msg.sender]; 
    if (docs.length >= MAX_DOCUMENTS_PER_USER) revert StorageLimitReached();

    docs.push(Document(_encryptedIpfsHash, _title));

    emit DocumentStored(msg.sender, _encryptedIpfsHash, _title);
}

function getDocument(uint256 _index) public view returns (string memory, string memory) {
    Document[] storage docs = userDocuments[msg.sender]; // Cache storage reference
    if (_index >= docs.length) revert IndexOutOfBounds(); // Custom error saves gas

    Document memory doc = docs[_index]; // Copy to memory (cheaper than accessing storage twice)
    return (doc.encryptedIpfsHash, doc.title);
}

function getDocumentCount() external view returns (uint256) {
    return userDocuments[msg.sender].length;
}


function deleteDocument(uint256 _index) external {
    Document[] storage docs = userDocuments[msg.sender]; // Cache storage reference
    uint256 lastIndex = docs.length - 1; // Cache last index
    if (_index > lastIndex) revert InvalidIndex(); // More gas-efficient than require()

    // Move last element to `_index` and remove last element
    docs[_index] = docs[lastIndex];
    docs.pop();

    emit DocumentDeleted(msg.sender, _index);
}
}