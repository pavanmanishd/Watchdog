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
app.use(express.json());


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

        update_model(criminalData.image,criminalData.criminalName);

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
app.get("/notify", (req, res) => {
    console.log("Request received from another server");
    // const data = req.body;
    const message = `Request received from another server`;
    counter++;
    console.log(message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
    res.send(message);
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

server.listen(3001, () => {
    console.log("Backend server is running on port 3001");
});

// restart the server when crashed
process.on("uncaughtException", () => {
    console.log("Process exited");
    process.exit(1);
}
);