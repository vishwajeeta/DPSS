import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import contractData from "./GenomicDataDID.json"; 

const CONTRACT_ADDRESS = contractData.address;

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [did, setDid] = useState("");
  //get did
  const [mydid,setMyDid]=useState("");
  // datastorage
  const [title, setTitle] = useState("");
  const [ipfsLink, setIpfsLink] = useState("");
  const [ownerDID, setOwnerDID] = useState("");
  //grant access
  const [recordId, setRecordId] = useState("");
  const [researcherDID, setResearcherDID] = useState("");

  //verificationResult
  const [verificationResult, setVerificationResult] = useState(null);

  //Access-check
  const [accessStatus, setAccessStatus] = useState(null);

  //Record list
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Store IPFS links for records
  const [ipfsLinks, setIpfsLinks] = useState({}); 


  // Connect Wallet Function
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") return alert("Please install MetaMask!");

    try {
      const web3Provider = new BrowserProvider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const contract = new Contract(CONTRACT_ADDRESS, contractData.abi, signer);

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(signer);
      setContract(contract);
    } catch (error) {
      console.error("Connection failed", error);
      alert("Failed to connect wallet");
    }
  };

    // Store Genomic Data Function
    const storeDocument = async () => {
      if (!contract || !title || !ipfsLink )
        return alert("Please connect wallet and fill all fields");
  
      try {
        const cleanTitle = title.trim();
        const cleanIpfsLink = ipfsLink.trim();

        const tx = await contract.storeDocument(cleanTitle, cleanIpfsLink);

        await tx.wait();
        alert("Data stored successfully!");
      } catch (error) {
        console.error("Storage failed", error);
        alert("Failed to store Data");
      }
    };

  // Grant Access Function
  const grantAccess = async () => {
    if (!contract || !recordId || !researcherDID)
      return alert("Please connect wallet and fill all fields");

    try {
      const tx = await contract.grantAccess(parseInt(recordId), researcherDID, { gasLimit: 100000 });
      await tx.wait();
      alert("Access granted successfully!");
    } catch (error) {
      console.error("Grant access failed", error);
      alert("Failed to grant access");
    }
  };

    // Revoke Access Function
    const revokeAccess = async () => {
      if (!contract || !recordId || !researcherDID)
        return alert("Please connect wallet and fill all fields");
  
      try {
        const tx = await contract.revokeAccess(parseInt(recordId), researcherDID, { gasLimit: 100000 });
        await tx.wait();
        alert("Access revoked successfully!");
      } catch (error) {
        console.error("Revoke access failed", error);
        alert("Failed to revoke access");
      }
    };

  // Verify Data Function
  const verifyData = async () => {
    if (!contract || !recordId || !dataHash)
      return alert("Please connect wallet and fill all fields");

    try {
      const isValid = await contract.verifyData(parseInt(recordId), dataHash);
      setVerificationResult(isValid);
    } catch (error) {
      console.error("Verification failed", error);
      alert("Failed to verify data");
    }
  };

  // Check Access Function
  const checkAccess = async () => {
    if (!contract || !recordId)
      return alert("Please connect wallet and fill all fields");

    try {
      const hasAccess = await contract.checkAccess(parseInt(recordId));
      setAccessStatus(hasAccess);
    } catch (error) {
      console.error("Access check failed", error);
      alert("Failed to check access");
    }
  };

  const fetchRecords = async () => {
    if (!contract) return alert("Please connect wallet first");
  
    setLoading(true);
    try {
      const recordCount = await contract.recordCount();
      const totalRecords = parseInt(recordCount.toString(), 10);  // Convert BigNumber to integer
  
      console.log("Total Records:", totalRecords);
      let fetchedRecords = [];
  
      for (let i = 1; i <= totalRecords; i++) {
        const record = await contract.publicGenomicRecords(i);
        console.log(`Fetched Record ${i}:`, record);
  
        fetchedRecords.push({
          
          recordId: record.recordId,
          dataHash: record.dataHash,
          ownerDID: record.ownerDID,
        });
      }
  
      setRecords(fetchedRecords);
    } catch (error) {
      console.error("Failed to fetch records", error);
      alert("Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch the IPFS link from the contract
  const fetchIPFSLink = async (recordId) => {
    try {
      const link = await contract.getIPFSLink(recordId);
      setIpfsLinks((prevLinks) => ({ ...prevLinks, [recordId]: link }));
    } catch (error) {
      console.error("Access denied or error fetching IPFS link:", error);
      alert("You do not have permission to access this file.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px"}}>
      <h1>Decentralized Data Storage System</h1>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>

     
      {account && (
        <div>
          <h2>Store Personal Data</h2>
          <input
            type="text"
            placeholder="Enter title"
            value={dataHash}
            onChange={(e) => setDataHash(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <input
            type="text"
            placeholder="Enter IPFS Link"
            value={ipfsLink}
            onChange={(e) => setIpfsLink(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <button onClick={storeDocument}>Store Data</button>
          </div>
      )}
          {/* {Grant Access} */}

           <div style={{ textAlign: "center", padding: "20px" }}>
      {/*<h1>Grant Access</h1>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button> */}

      {account && (
        <div>
          <h2>Grant Access to Researcher</h2>
          <input
            type="number"
            placeholder="Enter Record ID"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <input
            type="text"
            placeholder="Enter Researcher DID"
            value={researcherDID}
            onChange={(e) => setResearcherDID(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <button onClick={grantAccess}>Grant Access</button>
        </div>
      )}
    </div>
        

{account && (
        <div>
          <h2>Revoke Access from Researcher</h2>
          <input
            type="number"
            placeholder="Enter Record ID"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <input
            type="text"
            placeholder="Enter Researcher DID"
            value={researcherDID}
            onChange={(e) => setResearcherDID(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <button onClick={revokeAccess}>Revoke Access</button>
        </div>
      )}

{account && (
        <div>
          <h2>Verify Data Integrity</h2>
          <input
            type="number"
            placeholder="Enter Record ID"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <input
            type="text"
            placeholder="Enter Data Hash"
            value={dataHash}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <button onClick={verifyData}>Verify Data</button>

          {verificationResult !== null && (
            <p>
              {verificationResult ? "✅ Data is valid!" : "❌ Data does not match!"}
            </p>
          )}
           
        </div>
      )}
      {account && (
        <div>
          <h2>Verify Researcher Record Access</h2>
          <input
            type="number"
            placeholder="Enter Record ID"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          
          <button onClick={checkAccess}>Check Access</button>

          {accessStatus !== null && (
            <p>
              {accessStatus ? "✅ Access Granted!" : "❌ Access Denied!"}
            </p>
          )}
        </div>
      )}


{account && (
        <div>
          <h2>Stored Records</h2>
          <button onClick={fetchRecords} disabled={loading}>
            {loading ? "Fetching..." : "Fetch Records"}
          </button>

          {records.length > 0 && (
            <div>
              <h3>My Records</h3>
              {records.map((record, index) => (
                <div key={index} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                  <p><strong>ID:</strong> {record.recordId}</p>
                  <p><strong>Data Hash:</strong> {record.dataTitle}</p>
                  <p><strong>Owner DID:</strong> {record.ownerDID}</p>
                  {ipfsLinks[record.recordId] ? (
            <p><strong>IPFS Link:</strong> <a href={ipfsLinks[record.recordId]} target="_blank" rel="noopener noreferrer">View File</a></p>
          ) : (
            <button onClick={() => fetchIPFSLink(record.recordId)}>Request Access</button>
          )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
