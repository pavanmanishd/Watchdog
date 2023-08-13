const express = require("express");
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
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

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

    ws.on("message", (data) => {
        const criminalData = JSON.parse(data);

        // Save the image to a directory
        const image = criminalData.image;
        const criminalName = criminalData.criminalName;
        const imageBuffer = Buffer.from(image, "base64");
        const imagePath = path.join(__dirname, "uploads", `${criminalName}.jpg`);

        // if directory does not exist, create it
        if (!fs.existsSync(path.join(__dirname, "uploads"))) {
            fs.mkdirSync(path.join(__dirname, "uploads"));
        }

        // insert criminal data into database
        const sqlInsert = 'INSERT INTO CriminalData (name, age, height, weight, description) VALUES (?, ?, ?, ?, ?)';
        db.query(sqlInsert, [criminalData.criminalName, criminalData.criminalAge, criminalData.criminalHeight, criminalData.criminalWeight, criminalData.criminalDescription], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            else {
                console.log("Criminal data inserted into database");
            }
        });

        // store in uploads folder
        fs.writeFile(imagePath, imageBuffer, (err) => {
            if (err) {
                console.error("Error saving image:", err);
                return;
            } else {
                console.log("Image saved:", imagePath);
            }
        });


        // Process other criminal data
        console.log("Criminal Details:");
        console.log(`Name: ${criminalData.criminalName}`);
        console.log(`Age: ${criminalData.criminalAge}`);
        console.log(`Height: ${criminalData.criminalHeight}`);
        console.log(`Weight: ${criminalData.criminalWeight}`);
        console.log(`Description: ${criminalData.criminalDescription}`);

        update_model(criminalData.image, criminalData.criminalName);

    });

    ws.on("close", () => {
        console.log("WebSocket client disconnected");
    });
});


// send criminal data to model
function update_model(image, criminalName) {
    const model_api_url = "http://192.168.0.106:8000/add_criminal";
    axios.post(model_api_url, {
        image: image,
        criminalName: criminalName
    })
        .then((response) => {
            console.log(response.data);
            const data = response.data.message;
            const message = `Criminal data sent to model: ${data}`;
            console.log(message);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
        )
        .catch((error) => {
            console.log(error);
        });
}


// notifies the frontend that an enocunter has been detected
// app.post("/notify", async (req, res) => {
//     const data = req.body[0];

//     if (!fs.existsSync(path.join(__dirname, "encounters"))) {
//         fs.mkdirSync(path.join(__dirname, "encounters"));
//     }
//     if (!fs.existsSync(path.join(__dirname, "encounters", `${data.name}`))) {
//         fs.mkdirSync(path.join(__dirname, "encounters", `${data.name}`));
//     }
//     const imagePath = path.join(__dirname, "encounters", `${data.name}`, `${data.timestamp.replace(" ", "_")}.jpg`);
//     const imageBuffer = Buffer.from(data.image, "base64");
//     fs.writeFile(imagePath, imageBuffer, "base64")
//         .then(() => {
//             console.log("Image saved:", imagePath);
//         })
//         .catch((err) => {
//             console.error("Error saving image:", err);
//         });

//     const sqlInsert = 'INSERT INTO Encounters (name, confidence, timestamp, url,location, camera_id, filepath) VALUES (?, ?, ?, ?, ?, ?, ?)';
//     db.query(sqlInsert, [data.name, data.confidence, data.timestamp, data.camerasocketurl, data.location, data.camera_id, imagePath], (err, result) => {
//         if (err) {
//             console.log("Error inserting encounter data into database");
//             console.log(err);
//             return;
//         }
//         else {
//             console.log("Encounter data inserted into database");
//         }
//     });

//     const message = `Encounter detected`;
//     wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send({
//                 name: data.name,
//                 // confidence: data.confidence,
//                 timestamp: data.timestamp,
//                 // url: data.camerasocketurl,
//                 location: data.location,
//                 camera_id: data.camera_id,
//             });
//         }
//     });
//     res.send(message);
// });


app.post("/notify", async (req, res) => {
    try {
        const data = req.body[0];

        if (!fs.existsSync(path.join(__dirname, "encounters"))) {
            await fs.promises.mkdir(path.join(__dirname, "encounters"), { recursive: true });
        }
        if (!fs.existsSync(path.join(__dirname, "encounters", data.name))) {
            await fs.promises.mkdir(path.join(__dirname, "encounters", data.name), { recursive: true });
        }

        const imagePath = path.join(__dirname, "encounters", data.name, `${data.timestamp.replace(" ", "_")}.jpg`);
        const imageBuffer = Buffer.from(data.image, "base64");
        await fs.promises.writeFile(imagePath, imageBuffer, "base64");
        console.log("Image saved:", imagePath);

        const sqlInsert = 'INSERT INTO Encounters (name, confidence, timestamp, url, location, camera_id, filepath) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(sqlInsert, [data.name, data.confidence, data.timestamp, data.camerasocketurl, data.location, data.camera_id, imagePath], (err, result) => {
            if (err) {
                console.log("Error inserting encounter data into database");
                console.log(err);
            } else {
                console.log("Encounter data inserted into database");
            }
        });

        const message = { 
            name: data.name,
            timestamp: data.timestamp,
            location: data.location,
            camera_id: data.camera_id,
        };

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });

        res.send("Encounter detected");
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
            console.log(result);
            res.send(result);
        }
    }
    );
});

app.get("/criminals/:name", (req, res) => {
    const name = req.params.name;
    console.log(name);
    const sqlSelect = `SELECT * FROM CriminalData WHERE name = "${name}"`;
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
    const imagePath = path.join(__dirname, "uploads", `${name}.jpg`);
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


app.get("/encounters/:name/:date/:hr/:min/:sec", (req, res) => {
    const { name, date, hr,min,sec } = req.params;
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
    const { name, date, hr,min,sec } = req.params;
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