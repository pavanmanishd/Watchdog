const express = require("express");
const fileUpload = require("express-fileupload");
const http = require("http");
const WebSocket = require("ws");
const cors = require('cors');
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const mysql = require('mysql2');
const FormData = require('form-data')

require('dotenv').config();
const app = express();
app.use(cors())
app.use(express.static("public"));
app.use(express.json({ limit: "10000mb" }));
app.use(express.urlencoded({ limit: "10000mb", extended: false }));
app.use(fileUpload());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// connect to database
const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: 'hacktopiaDB'
});


// connect to frontend to receive criminal upload data
wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("close", () => {
        console.log("WebSocket client disconnected");
    });
});


// send criminal data to model
function update_model(image, criminalName) {
    const model_api_url = `${process.env.MODEL_IP}/criminal`;
    console.log(model_api_url, criminalName);
    const imageBase64 = Buffer.from(image.data).toString('base64');
    const formData = {
        image: imageBase64,
        criminalName: criminalName
    }
    axios.post(model_api_url,
        formData,

    )
        .then((response) => {
            console.log(response.data);
            const data = response.data.status;
            if (response.status == 200) {
                console.log("Criminal data updated");
            } else {
                console.log("Error updating criminal data");
            }
            return data;
        }
        )
        .catch((error) => {
            console.log(error);
        });
}
function delete_criminal_model(criminalName) {
    const model_api_url = `${process.env.MODEL_IP}/criminal/delete`;
    const formData = {
        criminalName: criminalName
    }
    axios.post(model_api_url, formData)
        .then((response) => {
            console.log(response.data);
            const data = response.data.message;
            if (response.status == 200) console.log("Criminal deleted successfully");
            else console.log("Error deleting criminal data");
            return data;
        })
        .catch((error) => {
            console.log(error);
        });


}

app.get('/', (req, res) => res.send('Hello World!'));


app.post("/notify", async (req, res) => {
    try {
        console.log(req.body);

        // Loop through the keys in the request body
        for (const encounterKey in req.body) {
            const encounter = req.body[encounterKey];

            // Create a directory for the encounters if it doesn't exist
            const encounterDirectory = path.join(__dirname, "encounters");
            if (!fs.existsSync(encounterDirectory)) {
                await fs.promises.mkdir(encounterDirectory, { recursive: true });
            }

            // Save the image
            const imagePath = path.join(encounterDirectory, `${encounterKey}.jpg`);
            const imageBuffer = Buffer.from(encounter.image, "base64");
            await fs.promises.writeFile(imagePath, imageBuffer, "base64");
            console.log("Image saved:", imagePath);

            // Insert encounter data into the database
            const sqlInsert = 'INSERT INTO Encounters (name, confidence, timestamp, url, location, camera_id, filepath) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(sqlInsert, [encounter.criminals[0].name, encounter.criminals[0].confidence, encounter.criminals[0].timestamp, encounter.criminals[0].camerasocketurl, encounter.criminals[0].location, encounter.criminals[0].camera_id, imagePath], (err, result) => {
                if (err) {
                    console.log("Error inserting encounter data into database");
                    console.log(err);
                } else {
                    console.log("Encounter data inserted into database");
                }
            });

            // Send message to WebSocket clients
            const message = {
                name: encounter.criminals[0].name,
                timestamp: encounter.criminals[0].timestamp,
                location: encounter.criminals[0].location,
                camera_id: encounter.criminals[0].camera_id,
            };

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }

        res.send("Encounter(s) detected");
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
});


app.get("/cameras", (req, res) => {
    // const model_api_url = "http://192.168.0.106:8000/get_cameras";
    // axios.get(model_api_url)
    //     .then((response) => {
    //         console.log(response.data);
    //         const data = response.data;
    //         res.status(200).send(data);
    //     }
    //     )
    //     .catch((error) => {
    //         console.log(error);
    //         res.status(500).send("Error occurred");
    //     }
    //     );

    //read file cameras.json
    const camerasPath = path.join(__dirname, "cameras.json");
    fs.readFile(camerasPath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            //parse data to json
            const cameras = JSON.parse(data);
            console.log(cameras);
            res.status(200).send(cameras);
        }
    }
    );
});

app.get("/cameras/:id", (req, res) => {
    const id = req.params.id;
    // const model_api_url = "http://192.168.0.106:8000/get_cameras";
    // axios.get(model_api_url)
    //     .then((response) => {
    //         console.log(response.data);
    //         const data = response.data[id];
    //         // const result = data.
    //         res.send(data);
    //     }
    //     )
    //     .catch((error) => {
    //         console.log(error);
    //     }
    //     );

    //read file cameras.json
    const camerasPath = path.join(__dirname, "cameras.json");
    fs.readFile(camerasPath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            //parse data to json
            console.log(id);
            const cameras = JSON.parse(data);
            console.log(cameras[id]);
            res.status(200).send(cameras[id]);
        }
    }
    );
});





app.get("/criminals", (req, res) => {
    const sqlSelect = 'SELECT * FROM CriminalData';
    db.query(sqlSelect, (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            // console.log(result);
            res.send(result);
        }
    }
    );
});

app.get("/criminals/:name", (req, res) => {
    const name = req.params.name;
    console.log(name);
    const sqlSelect = `SELECT * FROM CriminalData WHERE fullName = "${name}"`;
    console.log(sqlSelect);
    db.query(sqlSelect, [], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            console.log(result);
            res.send(result[0]);
        }
    }
    );
});

app.get("/criminals/:name/image", (req, res) => {
    const name = req.params.name;
    console.log(name);
    const imagePath = path.join(__dirname, "uploads", `${name}`, "image.jpg");
    console.log(imagePath);
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        }
    }
    );
});

app.get("/criminals/:name/arrestRecords", (req, res) => {
    const name = req.params.name;
    console.log(name);
    const arrestRecordsPath = path.join(__dirname, "uploads", `${name}`, "arrestRecords.pdf");
    console.log(arrestRecordsPath);
    fs.readFile(arrestRecordsPath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/pdf' });
            res.end(data);
        }
    }
    );
});

app.get("/criminals/:name/chargesOffenses", (req, res) => {
    const name = req.params.name;
    console.log(name);
    const chargesOffensesPath = path.join(__dirname, "uploads", `${name}`, "chargesOffenses.pdf");
    console.log(chargesOffensesPath);
    fs.readFile(chargesOffensesPath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/pdf' });
            res.end(data);
        }
    }
    );
});

app.get("/criminals/:name/courtDocuments", (req, res) => {
    const name = req.params.name;
    console.log(name);
    const courtDocumentsPath = path.join(__dirname, "uploads", `${name}`, "courtDocuments.pdf");
    console.log(courtDocumentsPath);
    fs.readFile(courtDocumentsPath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/pdf' });
            res.end(data);
        }
    }
    );
});

app.get("/criminals/:name/evidencePhoto", (req, res) => {
    const name = req.params.name;
    console.log(name);
    const evidencePhotoPath = path.join(__dirname, "uploads", `${name}`, "evidencePhoto.jpg");
    console.log(evidencePhotoPath);
    fs.readFile(evidencePhotoPath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        }
    }
    );
});


app.post("/criminals", (req, res) => {
    const { fullName, dateOfBirth, gender, nationality, identificationNumbers, height, weight, hairColor, eyeColor, scarsTattoosBirthmarks, address, phoneNumbers, emailAddress, familyMembers, coConspirators, descriptionofCrimes, modusOperandi, locationsOfIncidents, victimNames, victimStatements, additionalNotes } = req.body;
    if (fullName == '') fullName = null;
    if (dateOfBirth == '') dateOfBirth = null;
    if (gender == '') gender = null;
    if (nationality == '') nationality = null;
    if (identificationNumbers == '') identificationNumbers = null;
    // if(height=='')height =null;
    // if(weight=='')weight =null;
    if (hairColor == '') hairColor = null;
    if (eyeColor == '') eyeColor = null;
    if (scarsTattoosBirthmarks == '') scarsTattoosBirthmarks = null;
    if (address == '') address = null;
    if (phoneNumbers == '') phoneNumbers = null;
    if (emailAddress == '') emailAddress = null;
    if (familyMembers == '') familyMembers = null;
    if (coConspirators == '') coConspirators = null;
    if (descriptionofCrimes == '') descriptionofCrimes = null;
    if (modusOperandi == '') modusOperandi = null;
    if (locationsOfIncidents == '') locationsOfIncidents = null;
    if (victimNames == '') victimNames = null;
    if (victimStatements == '') victimStatements = null;
    if (additionalNotes == '') additionalNotes = null;
    const sqlInsert = "INSERT INTO CriminalData (fullName,dateOfBirth,gender,nationality,identificationNumbers,height,weight,hairColor,eyeColor,scarsTattoosBirthmarks,address,phoneNumbers,emailAddress,familyMembers,coConspirators,descriptionofCrimes,modusOperandi,locationsOfIncidents,victimNames,victimStatements,additionalNotes) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    db.query(sqlInsert, [fullName, dateOfBirth, gender, nationality, identificationNumbers, height, weight, hairColor, eyeColor, scarsTattoosBirthmarks, address, phoneNumbers, emailAddress, familyMembers, coConspirators, descriptionofCrimes, modusOperandi, locationsOfIncidents, victimNames, victimStatements, additionalNotes], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            console.log(result);
            res.send("Values inserted");
        }
    }
    );
});

app.post("/criminals/documents", async (req, res) => {
    try {
        const name = req.body.fullName;
        const photograph = req.files.photograph;
        const arrestRecords = req.files.arrestRecords;
        const chargesOffenses = req.files.chargesOffenses;
        const courtDocuments = req.files.courtDocuments;
        const evidencePhoto = req.files.evidencePhoto;

        const recordsPath = path.join(__dirname, "uploads", name);
        fs.mkdirSync(recordsPath, { recursive: true });

        if (photograph) {
            const imagePath = path.join(recordsPath, "image.jpg");
            photograph.mv(imagePath);
        }

        if (arrestRecords) {
            const arrestRecordsPath = path.join(recordsPath, "arrestRecords.pdf");
            arrestRecords.mv(arrestRecordsPath);
        }

        if (chargesOffenses) {
            const chargesOffensesPath = path.join(recordsPath, "chargesOffenses.pdf");
            chargesOffenses.mv(chargesOffensesPath);
        }

        if (courtDocuments) {
            const courtDocumentsPath = path.join(recordsPath, "courtDocuments.pdf");
            courtDocuments.mv(courtDocumentsPath);
        }

        if (evidencePhoto) {
            const evidencePhotoPath = path.join(recordsPath, "evidencePhoto.jpg");
            evidencePhoto.mv(evidencePhotoPath);
        }

        update_model(photograph, name);

        const formData = new FormData();
        const src = path.join(recordsPath, "image.jpg");


        const file = fs.createReadStream(src)
        formData.append('file', file)
  
        const pinataMetadata = JSON.stringify({
            name: 'File name',
        });
        formData.append('pinataMetadata', pinataMetadata);

        const pinataOptions = JSON.stringify({
            cidVersion: 0,
        })
        formData.append('pinataOptions', pinataOptions);

        try {
            const result = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", (formData), {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${process.env.JWT}`
                }
            });
            console.log(result.data.IpfsHash);
            const storeDB = 'Insert into ipfs (name,hash) values (?,?)'
            db.query(storeDB, [name,result.data.IpfsHash], (err, dbresult) => {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    console.log(dbresult);
                    // res.send("Values inserted");
                }
            }
            );
        } catch (error) {
            console.log(error);
        }

        res.status(200).send("Files saved");
    } catch (error) {
        console.error("Error saving files:", error);
        res.status(500).send("Error saving files");
    }
});

app.delete("/criminals/:name", (req, res) => {
    const name = req.params.name;
    const sqlDelete = `DELETE FROM CriminalData WHERE fullName = ?`; // Fix the SQL query
    db.query(sqlDelete, [name], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ "status": "error" }); // Handle the error
        } else {
            const path = require('path'); // Require path module
            const deletePath = path.join(__dirname, "uploads", name); // Correctly declare path
            console.log(deletePath);

            // Check if the directory exists before attempting to delete it
            fs.access(deletePath, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ "status": "error" }); // Handle the error
                }

                // Directory exists, so delete all files first
                fs.readdir(deletePath, (err, files) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({ "status": "error" }); // Handle the error
                    }

                    // Loop through files and delete each one
                    files.forEach((file) => {
                        const filePath = path.join(deletePath, file);
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send({ "status": "error" }); // Handle the error
                            }
                        });
                    });

                    // Once all files are deleted, delete the directory itself
                    fs.rmdir(deletePath, { recursive: true }, (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send({ "status": "error" }); // Handle the error
                        } else {
                            delete_criminal_model(name); // Make sure delete_criminal_model exists
                            // console.log(status);
                            const sqlDelete2 = `DELETE FROM Encounters WHERE name = ?`; // Fix the SQL query
                            db.query(sqlDelete2, [name], (err, result) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send({ "status": "error" }); // Handle the error
                                } else {
                                    console.log(result);
                                    return res.status(200).send({ "status": "success" }); // Handle the success
                                }
                            }
                            );
                        }
                    });
                });
            });
        }
    });
});


app.get("/encounters", (req, res) => {
    const sqlSelect = 'SELECT * FROM Encounters ORDER BY timestamp DESC';
    db.query(sqlSelect, (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            // console.log(result);
            res.send(result);
        }
    }
    );
});

app.get("/encounters/:limit", (req, res) => {
    const limit = req.params.limit;
    const sqlSelect = `SELECT * FROM Encounters ORDER BY timestamp DESC LIMIT ${limit}`;
    db.query(sqlSelect, (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            // console.log(result);
            res.send(result);
        }
    }
    );
});

app.get("/encounters/:name/:date/:hr/:min/:sec", (req, res) => {
    const { name, date, hr, min, sec } = req.params;
    const timestamp = `${date} ${hr}:${min}:${sec}`;
    const sqlSelect = `SELECT * FROM Encounters WHERE name = "${name}" AND timestamp = "${timestamp}"`;
    console.log(sqlSelect);
    db.query(sqlSelect, [], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            // console.log(result);
            res.send(result[0]);
        }
    }
    );
});

app.get("/encounters/:name/:date/:hr/:min/:sec/image", (req, res) => {
    const { name, date, hr, min, sec } = req.params;
    const timestamp = `${date} ${hr}:${min}:${sec}`;
    const sqlSelect = `SELECT filepath FROM Encounters WHERE name = "${name}" AND timestamp = "${timestamp}"`;
    console.log(sqlSelect);
    db.query(sqlSelect, [], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            // console.log(result);
            const imagePath = result[0].filepath;
            // read file from path
            fs.readFile(imagePath, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                    res.end(data);
                }
            }
            );
        }
    }
    );
});

app.get("/criminals/search/:term", (req, res) => {
    const term = req.params.term;
    console.log(term);
    const sqlSelect = `SELECT * FROM CriminalData WHERE fullName LIKE "%${term}%" OR dateOfBirth LIKE "%${term}%" OR height LIKE "%${term}%" OR weight LIKE "%${term}%"`;
    // console.log(sqlSelect);
    db.query(sqlSelect, [], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            // console.log(result);
            res.send(result);
        }
    }
    );
});

app.get("/encounters/search/:term", (req, res) => {
    const term = req.params.term;
    console.log(term);
    const sqlSelect = `SELECT * FROM Encounters WHERE name LIKE "%${term}%" OR timestamp LIKE "%${term}%" OR location LIKE "%${term}%" OR camera_id LIKE "%${term}%"`;
    // console.log(sqlSelect);
    db.query(sqlSelect, [], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            // console.log(result);
            res.send(result);
        }
    }
    );
});



app.get("/ipfs", (req, res) => {
    const IpfsHash = "QmUdDWekcCJNfBhi8ke72U67WeRjaWWVVT8xCErAt4Z27x"
    axios.get("http://localhost:5000/data/" + IpfsHash)
        .then((response) => {
            console.log(response.data);
            res.json(JSON.parse(response.data));
        })
        .catch((err) => {
            console.log(err);
            res.json({ status: false });
        })
})

app.post("/ipfs", async (req, res) => {
    const { name } = req.body; // Retrieve name and image from request body
    console.log(name);
    try {
        const response = await fetch("http://localhost:5000/data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                image
            })
        });

        const responseData = await response.json();
        res.send(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "false" });
    }
    res.send(name);
});



server.listen(3001, () => {
    console.log("Backend server is running on port 3001");
});

// restart the server when crashed
process.on("uncaughtException", () => {
    console.log("Process exited");
    process.exit(1);
}
);