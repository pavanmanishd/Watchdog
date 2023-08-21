const CriminalRecords = artifacts.require('CriminalRecords');

module.exports = function(deployer) {
  deployer.deploy(CriminalRecords).then(async instance => {
    // After deployment, print the contract address
    console.log("Contract address:", instance.address);
  });
};
