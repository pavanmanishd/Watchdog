const express = require('express');
const app = express();
const cors = require('cors')
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(cors())
app.use(express.static('public'));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: 'hacktopiaDB'
});


app.get('/', (req, res) => res.send('Hello World!'));

app.post('/signup', (req, res) => {
    const { username, password, email } = req.body;
    const sqlInsert = 'INSERT INTO UsersAuth (username, password, email) VALUES (?, ?, ?)';
    db.query(sqlInsert, [username, password, email], (err, result) => {
        if (err) {
            res.json({ status: false });
        }
        // console.log(result);
        res.json({ status: true });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // console.log(email, password)
    const sqlSelect = 'SELECT * FROM UsersAuth WHERE email = ? AND password = ?';
    db.query(sqlSelect, [email, password], (err, result) => {
        if (err) {
            res.json({ status: false, token: null });
        }
        // console.log(result);
        if (result.length == 0) {
            res.json({ status: false, token: null });
        }
        else {
            const token = jwt.sign({
                username: result[0].username,
                email: email
            },
                process.env.JWT_KEY,
            );
            const sqlUpdate = 'UPDATE UsersAuth SET token = ? WHERE email = ?';
            db.query(sqlUpdate, [token, email], (err, result) => {
                if (err) {
                    console.log(err);
                    res.json({ status: false, token: null });
                }
                else {
                    res.json({ status: true, token: token });
                }
            });
        }
    });
});

app.get('/verify/:password', (req, res) => {
    const token = req.headers['x-access-token'];
    // console.log(token)
    if (!token) {
        res.json({ status: false, message: 'No token provided' });
    }
    else {
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.json({ status: false, message: 'Failed to authenticate token', token: null });
            }
            else {
                const password = req.params.password;
                // console.log(password);
                const email = decoded.email;
                const sqlSelect = 'SELECT * FROM UsersAuth WHERE email = ? AND password = ?';
                db.query(sqlSelect, [email, password], (err, result) => {
                    if (err) {
                        res.json({ status: false, message: 'Failed to authenticate token', token: null });
                    }
                    else {
                        if (result.length == 0) {
                            res.json({ status: false, message: 'Failed to authenticate token', token: null });
                        }
                        else {
                            console.log(result);
                            res.json({ status: true, message: 'Success', token: result[0].token });
                        }
                    }
                }
                );
            }
        });
    }
});

app.get("/api/token", (req, res) => {
    const token = req.headers['x-access-token'];
    // console.log(token)
    if (!token) {
        res.json({ status: false, message: 'No token provided' });
    }
    else {
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.json({ status: false, message: 'Failed to authenticate token', token: null });
            }
            else {
                const email = decoded.email;
                const sqlSelect = 'SELECT * FROM UsersAuth WHERE email = ?';
                db.query(sqlSelect, [email], (err, result) => {
                    if (err) {
                        res.json({ status: false, message: 'Failed to authenticate token', token: null });
                    }
                    else {
                        res.json({ status: true, message: 'Success', token: result[0].token });
                    }
                }
                );
            }
        });
    }
});

app.get("/api/logout", (req, res) => {
    const token = req.headers['x-access-token'];
    // console.log(token)
    if (!token) {
        res.json({ status: false, message: 'No token provided' });
    }
    else {
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.json({ status: false, message: 'Failed to authenticate token', token: null });
            }
            else {
                const email = decoded.email;
                const sqlUpdate = 'UPDATE UsersAuth SET token = ? WHERE email = ?';
                db.query(sqlUpdate, [null, email], (err, result) => {
                    if (err) {
                        res.json({ status: false, message: 'Failed to authenticate token', token: null });
                    }
                    else {
                        res.json({ status: true, message: 'Success', token: null });
                    }
                }
                );
            }
        });
    }
});

app.get("/user", (req, res) => {
    const token = req.headers['x-access-token'];
    // console.log(token)
    if (!token) {
        res.json({ status: false, message: 'No token provided' });
    }
    else {
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.json({ status: false, message: 'Failed to authenticate token', token: null });
            }
            else {
                const email = decoded.email;
                const sqlSelect = 'SELECT * FROM UsersAuth WHERE email = ?';
                db.query(sqlSelect, [email], (err, result) => {
                    if (err) {
                        res.json({ status: false, message: 'Failed to authenticate token', token: null });
                    }
                    else {
                        res.json({ status: true, message: 'Success', user: result[0] });
                    }
                }
                );
            }
        });
    }
});

app.post("/user", (req, res) => {
    const token = req.headers['x-access-token'];
    // console.log(token)
    if (!token) {
        res.json({ status: false, message: 'No token provided' });
    }
    else {
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                res.json({ status: false, message: 'Failed to authenticate token', token: null });
            }
            else {
                const email = decoded.email;
                const { username, password, newpassword } = req.body;
                const sqlSelect = 'SELECT * FROM UsersAuth WHERE email = ? AND password = ?';
                db.query(sqlSelect, [email, password], (err, result) => {
                    if (err) {
                        res.json({ status: false, message: 'Failed to authenticate token', token: null });
                    }
                    else {
                        if (result.length == 0) {
                            res.json({ status: false, message: 'Failed to authenticate token', token: null });
                        }
                        else {
                            const sqlUpdate = 'UPDATE UsersAuth SET username = ?, password = ? WHERE email = ?';
                            db.query(sqlUpdate, [username, newpassword, email], (err, result) => {
                                if (err) {
                                    res.json({ status: false, message: 'Failed to authenticate token', token: null });
                                }
                                else {
                                    res.json({ status: true, message: 'Success', token: null });
                                }
                            }
                            );
                        }
                    }
                }
                );
            }
        });
    }
});


app.listen(8000, () => console.log('Server listening on port 8000!'));