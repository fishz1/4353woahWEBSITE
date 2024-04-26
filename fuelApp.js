// Import required modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Initialize Express app
const app = express();
app.use(express.static('public'));
const port = 3000;

// Initialize session middleware
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Initialize PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'password',
    port: 5432,
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
});

const testDatabaseConnection = () => {
    pool.query('SELECT NOW()', (err, res) => {
      // ...
    });
};
  
if (process.env.NODE_ENV !== 'test') {
    testDatabaseConnection();
}

async function createTables() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS UserCredentials CASCADE;
            CREATE TABLE UserCredentials (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE,
                password VARCHAR(255)
            )
        `);
        console.log('Users table created successfully');

        await pool.query(`
            DROP TABLE IF EXISTS ClientInformation;
            CREATE TABLE ClientInformation (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255),
                address1 VARCHAR(255),
                address2 VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(50),
                zipcode VARCHAR(20)
        )`);
        console.log('ClientInformation table created successfully');

        await pool.query(`
            DROP TABLE IF EXISTS FuelHistory;
            CREATE TABLE IF NOT EXISTS FuelHistory (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES UserCredentials(id),
                gallonsRequested FLOAT,
                deliveryAddress VARCHAR(255),
                deliveryDate DATE,
                suggestedPrice FLOAT,
                totalAmountDue FLOAT
            )
        `);
        console.log('FuelHistory table created successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
}

createTables();

// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint to serve root page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to serve login page
app.get('/loginPage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'loginPage.html'));
});

// Endpoint to serve registration page
app.get('/registrationPage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'registrationPage.html'));
});

// Endpoint to serve profile completion page
app.get('/editProfile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'editProfile.html'));
});

app.get('/profilePage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'profilePage.html'));
});

// Endpoint to serve home page
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to serve Fuel Quote Form
app.get('/fuelQuote.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'fuelQuote.html'));
});

// Endpoint to serve Fuel Quote History
app.get('/fuelQuoteHistory.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'fuelQuoteHistory.html'));
});

// Endpoint to handle login form submission
app.post('/login', (req, res) => {
    // Extract username and password from request body
    const { username, password } = req.body;


    // Query the UserCredentials table to retrieve the hashed password for the provided username
    pool.query('SELECT * FROM UserCredentials WHERE username = $1', [username], (err, result) => {
        if (err) {
            console.error('Error checking credentials:', err);
            res.redirect('/loginPage.html?error=invalidCredentials');
        } else {
            if (result.rows.length > 0) {
                // Retrieve the hashed password from the database
                const hashedPasswordFromDB = result.rows[0].password;

                // Compare the hashed password from the database with the hashed password generated from user input
                bcrypt.compare(password, hashedPasswordFromDB, (bcryptErr, bcryptResult) => {
                    if (bcryptErr) {
                        console.error('Error comparing passwords:', bcryptErr);
                        res.redirect('/loginPage.html?error=invalidCredentials');
                    } else {
                        if (bcryptResult) {
                            // If passwords match, store user ID in session
                            req.session.userId = result.rows[0].id;
                            res.redirect('/profilePage.html');
                        } else {
                            // If passwords don't match, redirect back to login page with an error message
                            res.redirect('/loginPage.html?error=invalidCredentials');
                        }
                    }
                });
            } else {
                // If no user found with the provided username, redirect back to login page with an error message
                res.redirect('/loginPage.html?error=invalidCredentials');
            }
        }
    });
});


// Function to validate password
function validatePassword(password) {
    // Define criteria for password
    const minLength = 8;
    const maxLength = 20;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Check if password meets all criteria
    return (
        password.length >= minLength &&
        password.length <= maxLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    );
}

// Endpoint to handle registration form submission
app.post('/register', async (req, res) => {
    // Extract username and password from request body
    const { username, password } = req.body;

    //WILL BE TAKEN OUT LATER
    console.log('Received username:', username);
    console.log('Received password:', password);
    
    // Perform validation (e.g., check if username is unique, password meets criteria, etc.)
    if (!validatePassword(password)) {
    // Password does not meet the criteria and user is redirected back to the registration page
    res.redirect('/registrationPage.html?error=password');
    } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    pool.query('SELECT * FROM UserCredentials WHERE username = $1', [username], (err, result) => {
        if (err) {
            console.error('Error checking username availability:', err);
            res.redirect('/registrationPage.html?error=database');
        } else {
            if (result.rows.length > 0) {
                // Username already exists
                res.redirect('/registrationPage.html?error=usernameTaken');
            } else {
                // Username is available, insert user into database
                
                pool.query('INSERT INTO UserCredentials (username, password) VALUES ($1, $2) RETURNING id', [username, hashedPassword], (err, result) => {
                    if (err) {
                        console.error('Error registering user:', err);
                        res.redirect('/registrationPage.html?error=database');
                    } else {
                        // Check if any rows were affected by the insertion
                        if (result.rows.length > 0) {
                            // Retrieve the id of the newly inserted user credentials
                            const userId = result.rows[0].id;
                            req.session.userId = result.rows[0].id;
                            // Insert empty profile data into ClientInformation table with the same user id
                            pool.query('INSERT INTO ClientInformation (id) VALUES ($1)', [userId], (err, result) => {
                                if (err) {
                                    console.error('Error creating profile for user:', err);
                                    res.redirect('/registrationPage.html?error=database');
                                } else {
                                    // Registration successful
                                    // Redirect to the profile page
                                    res.redirect('/profilePage.html');
                                }
                            });
                        } else {
                            // No rows were affected by the insertion
                            console.error('No rows affected by user registration');
                            res.redirect('/registrationPage.html?error=database');
                        }
                    }
                });
            }
        }
    });
    }
});

// Endpoint to handle profile form submission
app.post('/createProfile', async (req, res) => {
    const { full_name, address1, address2, city, state, zipcode } = req.body;
    const userId = req.session.userId;

    try {
        await pool.query('UPDATE ClientInformation SET full_name = $1, address1 = $2, address2 = $3, city = $4, state = $5, zipcode = $6 WHERE id = $7',
                         [full_name, address1, address2, city, state, zipcode, userId]);
        setTimeout(() => {
        res.redirect('/profilePage.html');
        }, 2000);
    } catch (error) {
        console.error('Error saving profile information:', error);
        res.redirect('/editProfile.html?error=database');
    }
});

// Endpoint to serve profile page
app.get('/profileData', (req, res) => {
    const userId = req.session.userId;

    // Fetch user's profile information from the database
    pool.query('SELECT * FROM ClientInformation WHERE id = $1', [userId], (err, result) => {
        if (err) {
            console.error('Error fetching profile data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // If user information is found, send it to the client as JSON
            if (result.rows.length > 0) {
                const profileData = result.rows[0];
                res.json(profileData);
            } else {
                res.status(404).json({ error: 'User information not found' });
            }
        }
    });
});

// Endpoint to handle storing fuel history
app.post('/storeFuelHistory', (req, res) => {
    const { gallonsRequested, deliveryAddress, deliveryDate, suggestedPrice, totalAmountDue } = req.body;
    const userId = req.session.userId;

    // Insert fuel history data into FuelHistory table
    pool.query('INSERT INTO FuelHistory (user_id, gallonsRequested, deliveryAddress, deliveryDate, suggestedPrice, totalAmountDue) VALUES ($1, $2, $3, $4, $5, $6)', 
               [userId, gallonsRequested, deliveryAddress, deliveryDate, suggestedPrice, totalAmountDue], 
               (err, result) => {
        if (err) {
            console.error('Error storing fuel history:', err);
            res.redirect('/fuelQuote.html?error=database');
        } else {
            setTimeout(() => {
            res.redirect('/fuelQuoteHistory.html');
            }, 2000); // Assuming redirection to a history page
        } 
    });
});

// Endpoint to fetch fuel history data
app.get('/fuelHistory', (req, res) => {
    const userId = req.session.userId;

    // Fetch fuel history data for the logged-in user from the database
    pool.query('SELECT * FROM FuelHistory WHERE user_id = $1', [userId], (err, result) => {
        if (err) {
            console.error('Error fetching fuel history:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // If fuel history data is found, send it to the client as JSON
            if (result.rows.length > 0) {
                const fuelHistory = result.rows;
                res.json(fuelHistory);
            } else {
                res.status(404).json({ error: 'Fuel history not found' });
            }
        }
    });
});

// Start the server
if (require.main === module) {
    // Start the server only if this file is run directly (not imported)
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

process.on('exit', () => {
    pool.end();
    console.log("done!")
});

module.exports = { app, validatePassword, pool };
