
const { handleUploadFile } = require('./uploadService'); // Import the handleUploadFile function

const ipfsHelper = require('./ipfsHelper');

async function handleUploadFile(file) {
    try {
        // Convert the uploaded file to a Buffer
        const bufferData = Buffer.from(await file.arrayBuffer());

        // Upload the buffer data to IPFS
        const ipfsCID = await ipfsHelper.uploadToIPFS(bufferData);

        console.log('Uploaded to IPFS. CID:', ipfsCID);

        // Store the IPFS CID in your smart contract or application's state
        // ...
    } catch (error) {
        console.error('Error handling file upload:', error);
    }
}

module.exports = {
    handleUploadFile
};
