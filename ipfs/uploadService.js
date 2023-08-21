import ipfsHelper from './ipfsHelper.js'; // Correct the import path

async function handleUploadFile(file) {
  try {
    // Convert the uploaded file to a Buffer
    const bufferData = Buffer.from(await file.arrayBuffer());

    // Upload the buffer data to IPFS
    const ipfsCID = await ipfsHelper.uploadToIPFS(bufferData);

    console.log('Uploaded to IPFS. CID:', ipfsCID);

    // Store the IPFS CID in your smart contract or application's state
    // ...

    return ipfsCID; // Return the CID
  } catch (error) {
    console.error('Error handling file upload:', error);
    throw error;
  }
}

export { handleUploadFile };
