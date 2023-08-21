import {create} from 'ipfs-http-client';

// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


async function uploadToIPFS(data) {
  try {
    const result = await ipfs.add(data);
    return result.cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

async function retrieveFromIPFS(cid) {
  try {
    const data = await ipfs.cat(cid);
    return data.toString();
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
}

const ipfsHelper = {
  uploadToIPFS,
  retrieveFromIPFS
};

export default ipfsHelper;
