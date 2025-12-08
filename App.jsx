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
     if (!account) return alert("Please connect to the wallet");
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
    if (!account) return alert("Please connect to the wallet");

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
     if (!account) return alert("Please connect to the wallet");

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
    else{
      connectWallet();
    }
  }, [account]);

  return (
    <div
  style={{
    minHeight: "100vh",
    width: "100vw", // full screen width
    backgroundColor: "#9eb5ecff", // dark blue background
    padding: "10px 10px",
    color: "#e2e8f0", // light slate text
    fontFamily: "'Segoe UI', sans-serif",
    boxSizing: "border-box", // ensures padding doesn't overflow viewport
  }}
>


  <div style={{ textAlign: "center", width:"98%", display:"flex",  justifyContent:"space-between",alignItems:"center"}}>
   
    <h1 style={{ color: "#3b82f6", fontSize: "32px"}}>
      <spam style={{color:"white"}}>📦🔗📜</spam> Decentralized Data Storage System
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
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
    >
      {account
        ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
        : "🔗 Connect Wallet"}
    </button>
  </div>

    
        <div
  style={{
    maxWidth: "500px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
    backgroundColor: "#295fdfff", // dark slate
    textAlign: "center",
    color: "#e2e8f0", // light slate text
    fontFamily: "'Segoe UI', sans-serif",
  }}
>
  <h2 style={{ marginBottom: "24px", color: "#a3c2f8ff", fontWeight: 600 }}>
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
      width: "90%",
      border: "1px solid #a3c2f8ff",
      borderRadius: "8px",
      backgroundColor: "#a3c2f8ff",
outline: "2px solid #4A90E2",
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
      width: "90%",
      border: "1px solid #a3c2f8ff",
      borderRadius: "8px",
      backgroundColor: "#a3c2f8ff",
    outline: "2px solid #4A90E2",
      fontSize: "14px",
    }}
  />

  {/* Store Button */}
  <button
    onClick={storeDocument}
    style={{
      padding: "12px 24px",
      backgroundColor: "#ffffff",
      color: "#3b82f6",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "15px",
      transition: "background-color 0.3s",
    }}
  >
    💾 Store Document
  </button>
</div>

    
  <div style={{ marginTop: "40px", textAlign: "center" }}>
    <h2 style={{ color: "#3b82f6", fontSize: "24px", marginBottom: "15px", marginTop:"25px"}}>
      📄 Your Documents
    </h2>
{documents.length === 0 ? (
  <p style={{ color: "#94a3b8" }}>No documents found./Loading....</p>
) : (
  <div
    class="grid grid-cols-2 gap-5 justify-items-center
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-6"
  >
    {documents.map((doc, idx) => (
      <div
        key={idx}
        style={{
          backgroundColor: "#295fdfff",
          borderRadius: "12px",
          padding: "20px",
          maxWidth: "600px",
          width: "auto", // make sure div takes full column width
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
          <strong style={{ color: "#a3c2f8ff" }}>Title:</strong> {doc.title}
        </p>
        <p style={{ wordBreak: "break-word", marginBottom: "16px" }}>
          <strong style={{ color: "#a3c2f8ff" }}>IPFS CID:</strong> {doc.encryptedIpfsHash}
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
            style={{borderColor:"#9eb5ecff",marginRight:3}}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
        >
          🗑️ Delete
        </button>
        <button
            onClick={() =>
              window.open(`https://gateway.pinata.cloud/ipfs/${doc.encryptedIpfsHash}`, "_blank")
            }
            className="px-4 py-2 bg-blue-600 text-white border-none rounded-md font-medium cursor-pointer transition-colors duration-300"
            style={{borderColor:"#9eb5ecff",marginLeft:3}}
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


    </div>
  );
}
