const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()
const JWT = process.env.JWT


const pinFileToIPFS = async () => {
    const formData = new FormData();
    const src = "./image.jpg";
    
    const file = fs.createReadStream(src)
    formData.append('file', file)
    // const pinataContent = JSON.stringify({
        
    // })

    // formData.append('pinataContent',pinataContent);
    
    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", (formData), {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      });
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
}

pinFileToIPFS()


// const getData = () => {
//     // https://ipfs.io/ipfs/hash

// }