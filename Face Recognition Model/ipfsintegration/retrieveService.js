// retrieveService.js

const ipfsHelper = require('./ipfsHelper');

async function handleRetrieveDataFromIPFS(cid) {
    try {
        // Retrieve data from IPFS
        const retrievedData = await ipfsHelper.retrieveFromIPFS(cid);

        console.log('Retrieved data from IPFS:', retrievedData);

        // Display or process the retrieved data in your application
        // ...
    } catch (error) {
        console.error('Error retrieving data from IPFS:', error);
    }
}

module.exports = {
    handleRetrieveDataFromIPFS
};

