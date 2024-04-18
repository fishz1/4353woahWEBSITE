// Import required modules
const request = require('supertest');
const { app, validatePassword } = require('./fuelApp'); 

describe('Express GET routes', () => {
    // Test GET / route
    it('should respond with home page content', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('index.html');
    });

    // TEST GET /index.html route
    it('should respond with home page content when logo is clicked', async () => {
        const response = await request(app).get('/index.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<a href="index.html"><img src="image/logo.jpg" height="100px"></a>');
        expect(response.text).toContain('<a href="loginPage.html">Login</a>');
        expect(response.text).toContain('<a href="registrationPage.html">Register now</a>');
    });

    // Test GET /loginPage.html route
    it('should respond with login page content', async () => {
        const response = await request(app).get('/loginPage.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<form id="loginForm" action="/login" method="POST" enctype="application/x-www-form-urlencoded">');
        expect(response.text).toContain('<input type="text" id="username" name="username"');
        expect(response.text).toContain('<input type="password" id="password" name="password"');
        expect(response.text).toContain('<button type="submit">Login</button>');
        expect(response.text).toContain('Don\'t have an account? <a href="registrationPage.html">Register here</a>');
    });

    // Test GET /registrationPage.html route
    it('should respond with registration page content', async () => {
        const response = await request(app).get('/registrationPage.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<form id="registrationForm" action="/register" method="POST">');
        expect(response.text).toContain('<input type="text" id="username" name="username" required>');
        expect(response.text).toContain('<input type="password" id="password" name="password" required>');
        expect(response.text).toContain('<button type="submit">Register</button>');
        expect(response.text).toContain('<p>Already have an account? <a href="loginPage.html">Login</a></p>');
    })

    // Test GET /editProfile.html route
    it('should respond with profile completion page content', async () => {
        const response = await request(app).get('/editProfile.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<form action="/createProfile" method="POST">');
        expect(response.text).toContain('<input type="text" id="full_name" name="full_name" maxlength="50" required>');
        expect(response.text).toContain('<input type="text" id="address1" name="address1" maxlength="100" required>');
        expect(response.text).toContain('<input type="text" id="address2" name="address2" maxlength="100">');
        expect(response.text).toContain('<input type="text" id="city" name="city" maxlength="100" required>');
        expect(response.text).toContain('<label for="state">State:</label>');
        expect(response.text).toContain('<input type="text" id="zipcode" name="zipcode" minlength="5" maxlength="9" required><br><br>');
        expect(response.text).toContain('<button type="submit">Save Profile</button>');
    })

    // Test GET /fuelQuote.html route
    it('should respond with fuel quote page content', async () => {
        const response = await request(app).get('/fuelQuote.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<label for="gallonsRequested">Gallons Requested:</label>');
        expect(response.text).toContain('<label for="deliveryAddress">Delivery Address:</label>');
        expect(response.text).toContain('<label for="deliveryDate">Delivery Date:</label>');
        expect(response.text).toContain('<label for="suggestedPrice">Suggested Price / gallon:</label>');
        expect(response.text).toContain('<label for="totalAmountDue">Total Amount Due:</label>');
        expect(response.text).toContain('<button type="submit">Submit</button>');
    })

    // Test GET /fuelQuoteHistory.html route
    it('should respond with fuel quote history page content', async () => {
        const response = await request(app).get('/fuelQuoteHistory.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<h2>Fuel Quote History</h2>');
        expect(response.text).toContain('<th>Gallons Requested</th>');
        expect(response.text).toContain('<th>Delivery Address</th>');
        expect(response.text).toContain('<th>Delivery Date</th>');
        expect(response.text).toContain('<th>Suggested Price / gallon</th>');
        expect(response.text).toContain('<th>Total Amount Due</th>');
    })

    // Add similar tests for other routes...
});

describe('Express POST endpoints', () => {
    it('should handle registration form submission', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                password: 'Test1234@'
            });
        expect(response.statusCode).toBe(302); // Assuming you redirect after successful registration

        // Check the location header to ensure it redirects to the correct page
        expect(response.headers.location).toBe('/editProfile.html');
    });

    it('should handle login form submission', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                username: 'user',
                password: 'Password@123'
            });
        expect(response.statusCode).toBe(302); 
        
        // Check the location header to ensure it redirects to the correct page
        expect(response.headers.location).toBe('/fuelQuoteHistory.html');
    });

    it('should handle profile form submission', async () => {
        const response = await request(app)
            .post('/createProfile')
            .send({
                full_name: 'Test User',
                address1: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipcode: '12345'
            });
        expect(response.statusCode).toBe(302); // Assuming you redirect after successful profile creation
    
    });
});

describe('Password validation', () => {
    // Test password validation function
    it('should return true for a valid password', () => {
        const password = 'Abcd1234@';
        expect(validatePassword(password)).toBe(true);
    });

    it('should return false for an invalid password', () => {
        // Test various invalid passwords
        expect(validatePassword('short')).toBe(false); // Too short
        expect(validatePassword('onlylowercase')).toBe(false); // No uppercase
        expect(validatePassword('ONLYUPPERCASE')).toBe(false); // No lowercase
        expect(validatePassword('12345678')).toBe(false); // No special character
        expect(validatePassword('specialchar@')).toBe(false); // No uppercase or lowercase
    });
});
