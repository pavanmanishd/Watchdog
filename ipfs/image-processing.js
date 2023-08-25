

import express from 'express';
import ipfsHelper from './ipfsHelper.js'; // Correct the import path
import { handleUploadFile } from './uploadService.js'; // Correct the import path
import Web3 from 'web3';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

let web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
//const Web3 = require('web3');
// Replace with your Ethereum client's URL


console.log('CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS);

console.log('INFURA_PROJECT_ID:', process.env.INFURA_PROJECT_ID);
console.log('SENDER_ADDRESS:', process.env.SENDER_ADDRESS);


const contractAddress = process.env.CONTRACT_ADDRESS;
const infuraProjectID = process.env.INFURA_PROJECT_ID;
const senderAddress = process.env.SENDER_ADDRESS;

const contractABI = [
  // Replace with your contract's ABI definitions
  {
    name: 'uploadRecord',
    type: 'function',
    inputs: [ 
      {
        name: 'criminalId',
        type: 'uint256'
      },
      {
        name: 'ipfsCID',
        type: 'string'
      }
    ]
  
  }
];


//const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectID}`);


const criminalRecordsContract = new web3.eth.Contract(contractABI, contractAddress, {
  from: senderAddress
});


const app = express();
const port = 3000;

app.use(express.json());

app.post('/process-image', async (req, res) => {
  try {
    const imageData = req.body.image; // Replace with actual image data
    const metadata = req.body.metadata; // Replace with actual metadata

    const ipfsCID = await handleUploadFile(imageData);

    const transaction = await criminalRecordsContract.methods
      .uploadRecord(metadata.criminalId, ipfsCID)
      .send({ from: senderAddress, gas: 200000 }); // Adjust gas as needed

    if (transaction.status) {
      res.status(200).json({ message: 'Image processed and stored in IPFS and Ethereum.' });
    } else {
      res.status(500).json({ error: 'Transaction failed.' });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'An error occurred while processing the image.' });
  }
});

// GET reqest API to retrieve data from IPFS
app.get('/retrieve-data/:criminalId', async (req, res) => {
  try {
    const { criminalId } = req.params;

    // Retrieve data from your smart contract (if needed)
    // ...

    // Retrieve data from IPFS using the CIDs
    const evidenceCID = "your_evidence_cid"; // Replace with actual CID
    const photographCID = "your_photograph_cid"; // Replace with actual CID
    const caseFileCID = "your_casefile_cid"; // Replace with actual CID

    const evidenceData = await handleRetrieveDataFromIPFS(evidenceCID);
    const photographData = await handleRetrieveDataFromIPFS(photographCID);
    const caseFileData = await handleRetrieveDataFromIPFS(caseFileCID);

    res.status(200).json({
      evidenceData,
      photographData,
      caseFileData
    });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'An error occurred while retrieving data.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

