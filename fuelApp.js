// Import required modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(express.static('public'));
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

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
app.get('/firstTimeProfile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'firstTimeProfile.html'));
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
    console.log('Request body:', req.body);

    // Logging received username and password (WILL BE TAKEN OUT LATER)
    console.log('Received username:', username);
    console.log('Received password:', password);

    // Perform validation 
    if (username === 'user' && password === 'pass') {
        // If credentials are valid, return success message
        res.redirect('/fuelQuoteHistory.html');
    } else {
        // If credentials are invalid, return error message
        res.status(401).send('Invalid username or password');
    }
});

// Endpoint to handle registration form submission
app.post('/register', (req, res) => {
    // Extract username and password from request body
    const { username, password } = req.body;

    //WILL BE TAKEN OUT LATER
    console.log('Received username:', username);
    console.log('Received password:', password);

    // Perform validation (e.g., check if username is unique, password meets criteria, etc.)
    // save into database in the future

    // Assuming successful registration
    res.redirect('/firstTimeProfile.html');
});

// Endpoint to handle profile form submission
app.post('/createProfile', (req, res) => {
    // Extract profile information from request body
    const { full_name, address1, address2, city, state, zipcode } = req.body;

    // Perform any necessary validation or processing of the profile data
    // save into database in the future

    // Assuming the profile data is saved successfully, user is sent back to home page
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
