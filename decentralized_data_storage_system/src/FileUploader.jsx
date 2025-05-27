import React, { useState } from "react";
import { uploadToPinata } from "./uploadToPinata"; // import function

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    try {
      const ipfsHash = await uploadToPinata(file);
      setCid(ipfsHash);
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Upload File to IPFS</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={handleUpload}>Upload</button>

      {cid && (
        <div>
          <p><strong>IPFS CID:</strong> {cid}</p>
          <a
            href={`https://gateway.pinata.cloud/ipfs/${cid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 View File
          </a>
        </div>
      )}
    </div>
  );
}
