// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CriminalRecords {
    struct Record {
        bytes32 evidenceCID;
        bytes32 photographCID;
        bytes32 caseFileCID;
    
    }

    mapping(bytes32 => Record) private records;
    mapping(address => bool) private authorizedUsers;

    constructor() {
        authorizedUsers[msg.sender] = true;
    }

    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender], "Not authorized");
        _;
    }

    function grantAccess(address user) public onlyAuthorized {
        authorizedUsers[user] = true;
    }

    function revokeAccess(address user) public onlyAuthorized {
        authorizedUsers[user] = false;
    }

    function uploadRecord(
        bytes32 criminalId,
        bytes32 evidenceCID,
        bytes32 photographCID,
        bytes32 caseFileCID
    ) public onlyAuthorized {
        records[criminalId] = Record({
            evidenceCID: evidenceCID,
            photographCID: photographCID,
            caseFileCID: caseFileCID
        });
    }

    function getRecordCIDs(bytes32 criminalId)
        public
        view
        returns (
            bytes32 evidenceCID,
            bytes32 photographCID,
            bytes32 caseFileCID
        )
    {
        Record storage record = records[criminalId];
        return (record.evidenceCID, record.photographCID, record.caseFileCID);
    }
}
