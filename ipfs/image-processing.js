import express from 'express';
import ipfsHelper from './ipfsHelper.js'; // Correct the import path
import { handleUploadFile } from './uploadService.js'; // Correct the import path
import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();

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

const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectID}`);
// const web3 = new Web3("http://127.0.0.1:8545");
const criminalRecordsContract = new web3.eth.Contract(contractABI, contractAddress);

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
