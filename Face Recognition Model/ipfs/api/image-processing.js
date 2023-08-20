const express = require('express');
const ipfsHelper = require('./ipfsHelper');
const { handleUploadFile } = require('./uploadService');
const Web3 = require('web3'); // Import the web3.js library

// Replace '0xYourContractAddress' with your actual contract address
const contractAddress = '0xYourContractAddress';

// Replace 'your-infura-project-id' with your actual Infura project ID
const infuraProjectID = 'your-infura-project-id';

// Replace 'your-sender-address' with your actual Ethereum sender address
const senderAddress = 'your-sender-address';

// Replace this array with your actual contract ABI
const contractABI = [
  {
    // Your contract's ABI entries
  }
];

// Create a web3 instance connected to an Ethereum node
const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectID}`);

// Instantiate the Ethereum contract
const criminalRecordsContract = new web3.eth.Contract(contractABI, contractAddress);

const app = express();
const port = 3000;

app.use(express.json());

// API endpoint for image processing
app.post('/process-image', async (req, res) => {
    try {
        // Assuming the request body contains image data and relevant metadata
        const imageData = req.body.image; // Replace with actual image data
        const metadata = req.body.metadata; // Replace with actual metadata

        // Convert the image data to IPFS and get the CID
        const ipfsCID = await handleUploadFile(imageData);

        // Store the IPFS CID and metadata in your Ethereum smart contract
        await criminalRecordsContract.methods.uploadRecord(metadata.criminalId, ipfsCID).send({ from: senderAddress });

        // Respond with success message
        res.status(200).json({ message: 'Image processed and stored in IPFS and Ethereum.' });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'An error occurred while processing the image.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
