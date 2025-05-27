import axios from "axios";

// Replace with your API credentials
const PINATA_API_KEY = '503e534f1fde412e2f2a';
const PINATA_SECRET_API_KEY = '4e07db529d18a9f2ba43cbc70bea33bd5e37493e14e4e0f7ee54ebcb3c1e12f1';

export async function uploadToPinata(file) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(url, formData, {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    const ipfsHash = res.data.IpfsHash;
    console.log("✅ Uploaded to Pinata:", ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error("❌ Pinata Upload Failed:", error);
    throw error;
  }
}
