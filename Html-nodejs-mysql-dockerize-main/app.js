const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost', // Change to the IP or hostname if MySQL is running in a different container
    user: 'root',
    password: 'pass', // Replace with your actual root password
    database: 'emails_db' // Replace with the name of your database
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Close the connection when the Node.js application exits
process.on('exit', () => {
    connection.end();
});
