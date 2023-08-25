const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()
const JWT = process.env.JWT


const pinFileToIPFS = async () => {
    const formData = new FormData();
    // const src = "./image.jpg";

    // const file = fs.createReadStream(src)
    // formData.append('file', file)
    const pinataContent = JSON.stringify({
        name:"anusha",
        class:"aiml",
        year:"3"  
    })

    formData.append('pinataContent',pinataContent);

    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", JSON.stringify(formData), {
        headers: {
          'Content-Type': `application/json`,
          'Authorization': `Bearer ${JWT}`
        }
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
    }
}



const getData = (data) => {
    // https://ipfs.io/ipfs/hash

    axios.get("https://ipfs.io/ipfs/"+data.IpfsHash)
        .then((response) => {
            console.log(response.data._streams[1])
        })

    // request to ipfs but if time took is greater than 10 seconds break the request and request again

}

const main = async() => {
    const data = await pinFileToIPFS()
    getData(data)
}

main()
