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
    const model_api_url = "http://192.168.0.106:8000/criminal";
    axios.post(model_api_url, {
        image: image,
        criminalName: criminalName
    })
        .then((response) => {
            console.log(response.data);
            const data = response.data.message;
            // const message = `Criminal data sent to model: ${data}`;
            // console.log(message);
            // wss.clients.forEach((client) => {
            //     if (client.readyState === WebSocket.OPEN) {
            //         client.send(message);
            //     }
            // });
            return data;
        }
        )
        .catch((error) => {
            console.log(error);
        });
}
function delete_criminal_model(criminalName) {
    const model_api_url = "http://192.168.0.106:8000/criminal";
    axios.delete(model_api_url,{
        criminalName: criminalName
    })
        .then((response)=>{
            console.log(response.data);
            const data = response.data.message;
            return data;
        })
}

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
    const model_api_url = "http://192.168.0.106:8000/get_cameras";
    axios.get(model_api_url)
        .then((response) => {
            console.log(response.data);
            const data = response.data;
            res.send(data);
        }
        )
        .catch((error) => {
            console.log(error);
        }
        );
});

app.get("/cameras/:id", (req, res) => {
    const id = req.params.id;
    const model_api_url = "http://192.168.0.106:8000/get_cameras";
    axios.get(model_api_url)
        .then((response) => {
            console.log(response.data);
            const data = response.data[id];
            // const result = data.
            res.send(data);
        }
        )
        .catch((error) => {
            console.log(error);
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

app.post("/criminals", (req, res) => {
    const { fullName, dateOfBirth, gender, nationality, identificationNumbers, height, weight, hairColor, eyeColor, scarsTattoosBirthmarks, address, phoneNumbers, emailAddress, familyMembers, coConspirators, descriptionofCrimes, modusOperandi, locationsOfIncidents, victimNames, victimStatements, additionalNotes } = req.body;
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

app.post("/criminals/documents", (req, res) => {
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

        res.send("Files saved");
    } catch (error) {
        console.error("Error saving files:", error);
        res.status(500).send("Error saving files");
    }
});

app.delete("/criminal/:name", (req, res) => {
    const name = req.params.name;
    const sqlDelete = `Delete from CriminalData where fullName = ?`
    db.query(sqlDelete, [name], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            console.log(result);
            const path = path.join(__dirname, "uploads", `${name}`);
            fs.rmdirSync(path, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    const status =  delete_criminal_model(name);
                    console.log(status);
                    res.status(200).send({ "status": "success" })
                }
            })
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





server.listen(3001, () => {
    console.log("Backend server is running on port 3001");
});

// restart the server when crashed
process.on("uncaughtException", () => {
    console.log("Process exited");
    process.exit(1);
}
);