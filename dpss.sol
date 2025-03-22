// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecureIPFSStorage {
    
    struct Document {
        string encryptedIpfsHash; // Stores encrypted IPFS hash
        string title;
    }

    mapping(address => Document[]) private userDocuments;

    uint256 public constant MAX_DOCUMENTS_PER_USER = 50; // Prevent storage spam

    event DocumentStored(address indexed user, string encryptedIpfsHash, string title);
    event DocumentDeleted(address indexed user, uint index);

    /// @notice Store a document with an encrypted IPFS hash and title
    /// @param _encryptedIpfsHash The encrypted IPFS hash (User should encrypt off-chain)
    /// @param _title The title of the document
    function storeDocument(string memory _encryptedIpfsHash, string memory _title) public {
        require(bytes(_encryptedIpfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_encryptedIpfsHash).length == 46, "Invalid IPFS hash length");
        require(userDocuments[msg.sender].length < MAX_DOCUMENTS_PER_USER, "Storage limit reached");

        userDocuments[msg.sender].push(Document(_encryptedIpfsHash, _title));

        emit DocumentStored(msg.sender, _encryptedIpfsHash, _title);
    }

    /// @notice Retrieve a specific document stored by the caller
    /// @param _index The index of the document to retrieve
    /// @return encryptedIpfsHash The encrypted IPFS hash of the document
    /// @return title The title of the document
    function getDocument(uint _index) public view returns (string memory encryptedIpfsHash, string memory title) {
        require(_index < userDocuments[msg.sender].length, "Document index out of bounds");

        Document storage doc = userDocuments[msg.sender][_index];
        return (doc.encryptedIpfsHash, doc.title);
    }

    /// @notice Get the number of documents stored by the caller
    /// @return count The total number of documents stored by the user
    function getDocumentCount() public view returns (uint count) {
        return userDocuments[msg.sender].length;
    }

    /// @notice Delete a document stored by the caller
    /// @param _index The index of the document to delete
    function deleteDocument(uint _index) public {
        require(_index < userDocuments[msg.sender].length, "Invalid index");

        // Move last element to deleted index and pop the last entry
        userDocuments[msg.sender][_index] = userDocuments[msg.sender][userDocuments[msg.sender].length - 1];
        userDocuments[msg.sender].pop();

        emit DocumentDeleted(msg.sender, _index);
    }
}
