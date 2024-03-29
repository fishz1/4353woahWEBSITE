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

    // Perform validation 
    if (username === 'user' && password === 'Password@123') {
        // If credentials are valid, redirect to fuelQuoteHistory.html
        res.redirect('/fuelQuoteHistory.html');
    } 
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
app.post('/register', (req, res) => {
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
        // Password meets the criteria
        // Save to database in the future
        res.redirect('/firstTimeProfile.html');
    }
});

// Endpoint to handle profile form submission
app.post('/createProfile', (req, res) => {
    // Extract profile information from request body
    const { full_name, address1, address2, city, state, zipcode } = req.body;

    // Perform any necessary validation or processing of the profile data
    // Save to database in the future

    // Assuming the profile data is saved successfully, user is sent back to home page
    res.redirect('/');
});

/* class PricingModule {
    constructor(gallonsRequested, customerType, state) {
        this.gallonsRequested = gallonsRequested;
        this.customerType = customerType;
        this.state = state;
    }

    calculatePrice() {
        // Implement your price calculation logic here
        // For example, you can have different pricing strategies based on customer type and state
        let basePricePerGallon = 2.5; // Base price per gallon
        
        // Apply discounts or surcharges based on customer type and state
        let totalPrice = this.gallonsRequested * basePricePerGallon;

        // Example: New customers get a discount
        if (this.customerType === 'new') {
            totalPrice *= 0.95; // 5% discount for new customers
        }

        // Example: Apply state-specific surcharges or discounts
        switch (this.state) {
            case 'TX':
                // Example: Texas customers get a discount
                totalPrice *= 0.98; // 2% discount for Texas customers
                break;
            case 'CA':
                // Example: California customers get a surcharge
                totalPrice *= 1.03; // 3% surcharge for California customers
                break;
            // Add cases for other states as needed
        }

        // Round the total price to two decimal places
        return Math.round(totalPrice * 100) / 100;
    }
} */

// Export the Express app instance
module.exports.app = app;

// Export the validatePassword function
module.exports.validatePassword = validatePassword;

// Start the server
if (require.main === module) {
    // Start the server only if this file is run directly (not imported)
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}
