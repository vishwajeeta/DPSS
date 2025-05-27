import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import FileUploader from "./FileUploader";

import contractData from "./SecureIPFSStorage.json"; // ABI + address

const CONTRACT_ADDRESS = contractData.address;

export default function IPFSStorageApp() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  const [ipfsHash, setIpfsHash] = useState("");
  const [title, setTitle] = useState("");
  const [documents, setDocuments] = useState([]);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask first");

    const web3Provider = new BrowserProvider(window.ethereum);
    const signer = await web3Provider.getSigner();
    const userAccount = await signer.getAddress();
    const contractInstance = new Contract(CONTRACT_ADDRESS, contractData.abi, signer);

    setProvider(web3Provider);
    setAccount(userAccount);
    setContract(contractInstance);
  };

  // Store document
  const storeDocument = async () => {
    if (!contract || !ipfsHash || !title) return alert("All fields required");

    try {
      const tx = await contract.storeDocument(ipfsHash.trim(), title.trim());
      await tx.wait();
      alert("Document stored successfully");
      fetchDocuments();
    } catch (err) {
      console.error("Error storing document", err);
      alert("Storage failed");
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    if (!contract || !account) return;

    try {
      const count = await contract.getDocumentCount();
      const docs = [];

      for (let i = 0; i < count; i++) {
        const [hash, docTitle] = await contract.getDocument(i);
        docs.push({ index: i, encryptedIpfsHash: hash, title: docTitle });
      }

      setDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  // Delete a document
  const deleteDocument = async (index) => {
    if (!contract) return;

    try {
      const tx = await contract.deleteDocument(index);
      await tx.wait();
      alert("Document deleted");
      fetchDocuments();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete document");
    }
  };

  useEffect(() => {
    if (account) {
      fetchDocuments();
    }
  }, [account]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Secure IPFS Storage</h1>

      <button onClick={connectWallet}>
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>

      {account && (
        <div>
          <FileUploader/>
          <h2>Store Document</h2>
          <input
            type="text"
            placeholder="Encrypted IPFS Hash (length 46)"
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            style={{ margin: "10px", padding: "8px", width: "300px" }}
          />
          <input
            type="text"
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ margin: "10px", padding: "8px", width: "300px" }}
          />
          <button onClick={storeDocument}>Store</button>
        </div>
      )}

      {account && (
        <div>
          <h2>Your Documents</h2>
          {documents.map((doc, idx) => (
            <div key={idx} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
              <p><strong>Title:</strong> {doc.title}</p>
              <p><strong>Encrypted Hash:</strong> {doc.encryptedIpfsHash}</p>
              <button onClick={() => deleteDocument(doc.index)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
