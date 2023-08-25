const express = require('express');
const cors = require('cors');
const axios = require('axios')
const fetch = require('node-fetch');
const FormData = require('form-data');
const dotenv = require('dotenv')
dotenv.config()

const app = express();
const port = 5000; // You can change this to any port you prefer

// Middleware to parse JSON in request body
app.use(express.json());
app.use(cors())
app.use(express.static("public"));
app.use(express.json({ limit: "10000mb" }));
app.use(express.urlencoded({ limit: "10000mb", extended: false }));


// Middleware to parse JSON in request body
app.use(express.json());

// Sample JWT token (replace with your actual token)
const JWT = process.env.JWT;


app.get("/data/:IpfsHash", (req, res) => {
    const { IpfsHash } = req.params;
    console.log(IpfsHash);
    fetch("https://ipfs.io/ipfs/" + IpfsHash)
        .then((response) => response.json())
        .then((json) => {
            res.status(200).json(json);
        })
        .catch((error) => {
            console.error("Error while fetching IPFS data:", error);
            res.status(500).json({ status: false });
        });
});

app.post("/data", async (req, res) => {
    const { name, image } = req.body;
    const pinataContent = image; // Assuming image is already in the correct format
    const formData = new FormData();
    formData.append('pinataContent', pinataContent);

    const pinataMetadata = JSON.stringify({
        name
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0
    });
    formData.append('pinataOptions', pinataOptions);

    try {
        const result = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'Authorization': `Bearer ${JWT}`
            }
        });

        console.log(result.data);
        res.json(result.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "false" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});
