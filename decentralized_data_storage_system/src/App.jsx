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
    <div
  style={{
    minHeight: "100vh",
    width: "100vw", // full screen width
    backgroundColor: "#0f172a", // dark blue background
    padding: "40px 20px",
    color: "#e2e8f0", // light slate text
    fontFamily: "'Segoe UI', sans-serif",
    boxSizing: "border-box", // ensures padding doesn't overflow viewport
  }}
>


  <div style={{ textAlign: "center" }}>
    <h1 style={{ color: "#3b82f6", fontSize: "32px", marginBottom: "20px" }}>
      🚀 Decentralized Data Storage System
    </h1>

    <button
      onClick={connectWallet}
      style={{
        padding: "12px 20px",
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        fontWeight: 600,
        fontSize: "15px",
        cursor: "pointer",
        transition: "background-color 0.3s",
        marginBottom: "40px",
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
    >
      {account
        ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
        : "🔗 Connect Wallet"}
    </button>
  </div>

      {account && (
        <div
  style={{
    maxWidth: "500px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
    backgroundColor: "#0f172a", // dark slate
    textAlign: "center",
    color: "#e2e8f0", // light slate text
    fontFamily: "'Segoe UI', sans-serif",
  }}
>
  <h2 style={{ marginBottom: "24px", color: "#3b82f6", fontWeight: 600 }}>
    📁 Upload & Store Document
  </h2>

  {/* Drag & Drop Upload */}
  <div style={{ marginBottom: "20px" }}>
    <FileUploader />
  </div>

  {/* IPFS Hash Input */}
  <input
    type="text"
    placeholder="Enter IPFS CID (length 46)"
    value={ipfsHash}
    onChange={(e) => setIpfsHash(e.target.value)}
    style={{
      marginBottom: "15px",
      padding: "12px",
      width: "100%",
      border: "1px solid #334155",
      borderRadius: "8px",
      backgroundColor: "#1e293b",
      color: "#e2e8f0",
      fontSize: "14px",
    }}
  />

  {/* Document Title Input */}
  <input
    type="text"
    placeholder="Document Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    style={{
      marginBottom: "20px",
      padding: "12px",
      width: "100%",
      border: "1px solid #334155",
      borderRadius: "8px",
      backgroundColor: "#1e293b",
      color: "#e2e8f0",
      fontSize: "14px",
    }}
  />

  {/* Store Button */}
  <button
    onClick={storeDocument}
    style={{
      padding: "12px 24px",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "15px",
      transition: "background-color 0.3s",
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
  >
    💾 Store Document
  </button>
</div>

      )}

      {account && (
  <div style={{ marginTop: "40px", textAlign: "center" }}>
    <h2 style={{ color: "#3b82f6", fontSize: "24px", marginBottom: "20px" }}>
      📄 Your Documents
    </h2>
{documents.length === 0 ? (
  <p style={{ color: "#94a3b8" }}>No documents found./Loading....</p>
) : (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)", // 2 columns of equal width
      gap: "20px", // spacing between grid items
      justifyItems: "center", // center items horizontally inside each grid cell
    }}
  >
    {documents.map((doc, idx) => (
      <div
        key={idx}
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "20px",
          maxWidth: "600px",
          width: "100%", // make sure div takes full column width
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
          textAlign: "left",
          color: "#e2e8f0",
        }}
      >
        <img
  src={`https://gateway.pinata.cloud/ipfs/${doc.encryptedIpfsHash}`}
  alt={doc.title}
  style={{
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover",           // or 'contain' based on your layout
    borderRadius: "8px",         // Rounded corners
    marginBottom: "16px",
    display: "block"              // Fix inline rendering issues
  }}
/>

        <p style={{ marginBottom: "8px" }}>
          <strong style={{ color: "#60a5fa" }}>Title:</strong> {doc.title}
        </p>
        <p style={{ wordBreak: "break-word", marginBottom: "16px" }}>
          <strong style={{ color: "#60a5fa" }}>IPFS CID:</strong> {doc.encryptedIpfsHash}
        <button
  onClick={() => {
    navigator.clipboard.writeText(doc.encryptedIpfsHash);
    alert("📋 IPFS CID copied to clipboard!");
  }}
  style={{ marginLeft: "15px" }}
>📋</button>
</p>
        <button
          onClick={() => deleteDocument(doc.index)}
          className="px-4 py-2 bg-red-500 text-white border-none rounded-md font-medium cursor-pointer transition-colors duration-300"
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
        >
          🗑️ Delete
        </button>
        <button
            onClick={() =>
              window.open(`https://gateway.pinata.cloud/ipfs/${doc.encryptedIpfsHash}`, "_blank")
            }
            className="px-4 py-2 bg-blue-600 text-white border-none rounded-md font-medium cursor-pointer transition-colors duration-300"
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
          >
            🔗 View Document on IPFS
          </button>
      </div>
    ))}
  </div>
)}

  </div>
)}

    </div>
  );
}
