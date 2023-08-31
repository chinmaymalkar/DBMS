const express = require('express');
const mysql = require('mysql2');
const { body, validationResult } = require('express-validator');
const app = express();
const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not provided in the environment variables


require('dotenv').config();

const database = mysql.createConnection({
    host: process.env.DB_HOST, // Change to the IP or hostname if MySQL is running in a different container
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

database.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Add this middleware to parse JSON data
// app.use(express.json()); // use for api or backend to parse json data
app.use(express.static(__dirname + '/'));

app.get('/init', (req, res) => {
    const createTableQueries = [
        'CREATE TABLE IF NOT EXISTS students (stud_no INT PRIMARY KEY, name VARCHAR(50), prn INT, department VARCHAR(50), fees INT);',
        // 'CREATE TABLE IF NOT EXISTS student_state (stud_no INT PRIMARY KEY, state VARCHAR(50));',
        // 'CREATE TABLE IF NOT EXISTS state_country (state VARCHAR(50), country VARCHAR(50));',
        // 'CREATE TABLE IF NOT EXISTS student_age (stud_no INT PRIMARY KEY, age INT);'
    ];

    const createTablePromises = createTableQueries.map(query => {
        return new Promise((resolve, reject) => {
            database.query(query, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(createTablePromises)
        .then(() => {
            res.send('Tables created successfully!');
        })
        .catch(err => {
            res.status(500).send('Error creating tables: ' + err.message);
        });
});


app.get('/form',
    function (req, res) {
        res.sendFile(__dirname + "/form.html")
    }
)

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit-form',
    body('name').not().isEmpty().escape(),
    // body('state').not().isEmpty().escape(), // Add state field validation
    // body('country').not().isEmpty().escape(), // Add country field validation
    // body('age').isInt().toInt(), // Add age field validation and convert to integer
    (req, res) => {
        const errors = validationResult(req);
        console.log(req.body);

        if (errors.array().length > 0) {
            res.send(errors.array());
        } else {

            const student = {
                stud_no: req.body.stud_no,
                name: req.body.name,
                prn: req.body.prn,
                department: req.body.department,
                fees: req.body.fees
            };

            // const studentState = {
            //     stud_no: req.body.stud_no,
            //     state: req.body.state
            // };

            // const stateCountry = {
            //     state: req.body.state,
            //     country: req.body.country
            // };

            // const studentAge = {
            //     stud_no: req.body.stud_no,
            //     age: req.body.age
            // };

            // Assuming you have created the tables previously
            const queries = [
                'INSERT INTO students SET ?',
                // 'INSERT INTO student_state SET ?',
                // 'INSERT INTO state_country SET ?',
                // 'INSERT INTO student_age SET ?',
            ];

            const values = [student];

            const insertPromises = queries.map((query, index) => {
                return new Promise((resolve, reject) => {
                    database.query(query, values[index], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });

            Promise.all(insertPromises)
                .then(() => {
                    res.send('Data inserted successfully!');
                })
                .catch(err => {
                    res.status(500).send('Error inserting data: ' + err.message);
                });
        }
    });


app.get('/', (req, res) => {
    const sqlQuery = `
            SELECT * FROM students
        `;

    database.query(sqlQuery, (err, result) => {
        if (err) throw err;

        res.json({ 'studentsData': result });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});