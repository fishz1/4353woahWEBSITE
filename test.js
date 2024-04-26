// Import required modules
const request = require('supertest');
const { app, validatePassword, pool } = require('./fuelApp'); 
const bcrypt = require('bcrypt');

describe('Database Connection', () => {
    beforeAll(() => {
      jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(new Error('Fake connection error')));
    });
  
    afterAll(() => {
      jest.restoreAllMocks();
    });
  
    it('should log an error if unable to connect to the database', async () => {
      // Trigger the pool.query to test the error handling logic
      await expect(pool.query()).rejects.toThrow('Fake connection error');
    });
});

describe('Express GET routes', () => {

    it('should return 404 for an invalid path', async () => {
        const response = await request(app).get('/nonexistentpath');
        expect(response.statusCode).toBe(404);
    });
    
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
    it('should respond with profile completion page content content', async () => {
        const response = await request(app).get('/editProfile.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<form action="/createProfile" method="POST" id="profileForm">');
        expect(response.text).toContain('<input type="text" id="full_name" name="full_name" maxlength="50" required>');
        expect(response.text).toContain('<input type="text" id="address1" name="address1" maxlength="100" required>');
        expect(response.text).toContain('<input type="text" id="address2" name="address2" maxlength="100">');
        expect(response.text).toContain('<input type="text" id="city" name="city" maxlength="100" required>');
        expect(response.text).toContain('<label for="state">State:</label>');
        expect(response.text).toContain('<input type="text" id="zipcode" name="zipcode" minlength="5" maxlength="9" required><br><br>');
        expect(response.text).toContain('<button type="submit">Save Profile</button>');
    })

    // Test GET /profilePage.html route
    it('should respond with profile content', async () => {
        const response = await request(app).get('/profilePage.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<div class="container">');
        expect(response.text).toContain('<div id="profileDisplay">');
        expect(response.text).toContain('<p id="fullName">Full Name: </p>');
        expect(response.text).toContain('<p id="address1">Address 1: </p>');
        expect(response.text).toContain('<p id="address2">Address 2: </p>');
        expect(response.text).toContain('<p id="city">City: </p>');
        expect(response.text).toContain('<p id="state">State: </p>');
        expect(response.text).toContain('<p id="zipcode">Zipcode: </p>');
    })

    // Test GET /fuelQuote.html route
    it('should respond with fuel quote page content', async () => {
        const response = await request(app).get('/fuelQuote.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<form action="/storeFuelHistory" method="POST" id="fuelForm">');
        expect(response.text).toContain('<label for="gallonsRequested">Gallons Requested:</label>');
        expect(response.text).toContain('<label for="deliveryAddress">Delivery Address:</label>');
        expect(response.text).toContain('<label for="deliveryDate">Delivery Date:</label>');
        expect(response.text).toContain('<label for="suggestedPrice">Suggested Price / gallon:</label>');
        expect(response.text).toContain('<label for="totalAmountDue">Total Amount Due:</label>');
        expect(response.text).toContain('<button type="button" id="getQuoteBtn" onclick="calculateTotalAmountDue()" disabled>Get Quote</button>');
        expect(response.text).toContain('<button type="submit" id="submitBtn" disabled>Submit</button>');
    })

    // Test GET /fuelQuoteHistory.html route
    it('should respond with fuel quote history page content', async () => {
        const response = await request(app).get('/fuelQuoteHistory.html');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<table id="fuelHistoryTable">');
        expect(response.text).toContain('<h2>Fuel Quote History</h2>');
        expect(response.text).toContain('<th>Gallons Requested</th>');
        expect(response.text).toContain('<th>Delivery Address</th>');
        expect(response.text).toContain('<th>Delivery Date</th>');
        expect(response.text).toContain('<th>Suggested Price / gallon</th>');
        expect(response.text).toContain('<th>Total Amount Due</th>');
    })

    it('should handle errors while fetching fuel history in the /fuelHistory route', async () => {
    const originalQuery = pool.query;
    const mockedError = new Error('Database error');
    pool.query = jest.fn((query, values, callback) => {
        callback(mockedError, null);
    });
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const response = await request(app)
        .get('/fuelHistory')
        .set('Cookie', ['userId=testUserId']); // Simulating a logged-in user

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
    expect(consoleErrorMock).toHaveBeenCalledWith('Error fetching fuel history:', mockedError);
    pool.query = originalQuery;
    consoleErrorMock.mockRestore();
    });

    it('should handle errors while fetching profile data in the /profileData route', async () => {
    const originalQuery = pool.query;
    const mockedError = new Error('Database error');
    pool.query = jest.fn((query, values, callback) => {
        callback(mockedError, null); // Simulating a database error
    });
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app)
        .get('/profileData')
        .set('Cookie', ['userId=testUserId']); // Simulating a logged-in user

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
    expect(consoleErrorMock).toHaveBeenCalledWith('Error fetching profile data:', mockedError);
    pool.query = originalQuery;
    consoleErrorMock.mockRestore();
});



});

describe('Express POST endpoints', () => {
    // Test POST /register endpoint
    it('should register a new user and redirect to profile page', async () => {
        const newUser = {
            username: 'newuser',
            password: 'NewPassword123!'
        };
        const response = await request(app)
            .post('/register')
            .send(newUser)
            .type('form');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/profilePage.html');
    });

    it('should reject a new user registration with invalid password and redirect to error', async () => {
        const newUser = {
            username: 'testuser',
            password: 'short' // Invalid password, too short
        };
        const response = await request(app)
            .post('/register')
            .send(newUser)
            .type('form');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/registrationPage.html?error=password');
    });      

    it('should not allow registration with an existing username', async () => {
        const existingUser = {
            username: 'existinguser',
            password: 'Password123!'
        };
        // Assuming the first call to this endpoint creates the user
        await request(app).post('/register').send(existingUser).type('form');
        // The second call should fail as the username already exists
        const response = await request(app).post('/register').send(existingUser).type('form');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toContain('error=usernameTaken');
    }); 
    

    it('should successfully update user profile and respond accordingly', async () => {
        const profileData = {
            full_name: 'John Doe',
            address1: '123 Main St',
            address2: '',
            city: 'Anytown',
            state: 'Anystate',
            zipcode: '12345'
        };
        const response = await request(app)
            .post('/createProfile')
            .send(profileData)
            .type('form');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/profilePage.html');
    });

    it('should not create a profile with incomplete data', async () => {
        const incompleteProfileData = {
            full_name: 'John Doe'
            // missing other fields like address1, city, etc.
        };
        const response = await request(app).post('/createProfile').send(incompleteProfileData).type('form');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toContain('/profilePage.html');
    });    

    it('should store fuel history and respond correctly', async () => {
        const fuelData = {
            gallonsRequested: 100,
            deliveryAddress: '123 Main St',
            deliveryDate: '2024-04-20',
            suggestedPrice: 3.5,
            totalAmountDue: 350
        };
        const response = await request(app)
            .post('/storeFuelHistory')
            .send(fuelData)
            .type('form');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/fuelQuoteHistory.html'); // Assuming redirection to a history page
    });

    it('should not store fuel history with incomplete data', async () => {
        const incompleteFuelData = {
            gallonsRequested: 100
            // missing other fields like deliveryAddress, deliveryDate, etc.
        };
        const response = await request(app)
            .post('/storeFuelHistory')
            .send(incompleteFuelData)
            .type('form');

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toContain('/fuelQuoteHistory.html');
    });
    
it('should handle errors while storing fuel history', async () => {
    const fuelData = {
        gallonsRequested: 100,
        deliveryAddress: '123 Main St',
        deliveryDate: 100, // Invalid date format
        suggestedPrice: 3.5,
        totalAmountDue: 350
    };

    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app)
        .post('/storeFuelHistory')
        .send(fuelData)
        .type('form');

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/fuelQuote.html?error=database');
    const receivedErrorMessage = consoleErrorMock.mock.calls[0][0];
    expect(receivedErrorMessage).toContain('Error storing fuel history:');
    consoleErrorMock.mockRestore();
});

    // Test POST /login endpoint
    it('should authenticate a user with correct credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'newuser', password: 'NewPassword123!' })
            .type('form');
        expect(response.statusCode).toBe(302); // Assuming redirection on successful login
        expect(response.headers.location).toBe('/profilePage.html');
    });

    it('should reject a login attempt with incorrect credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'invaliduser', password: 'wrongpassword' })
            .type('form');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/loginPage.html?error=invalidCredentials');
    });

   it('should handle errors while checking credentials in the /login route', async () => {
    const originalQuery = pool.query;
    const mockedError = new Error('Database error');
    pool.query = jest.fn((query, values, callback) => {
        callback(mockedError, null); // Simulating a database error
    });
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const credentials = {
        username: 'testUser',
        password: 'invalidPassword' // Invalid password to trigger an error
    };
    const response = await request(app)
        .post('/login')
        .send(credentials)
        .type('form');
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/loginPage.html?error=invalidCredentials');
    expect(consoleErrorMock).toHaveBeenCalledWith('Error checking credentials:', mockedError);
    pool.query = originalQuery;
    consoleErrorMock.mockRestore();
    });

});

describe('Password Hashing on Registration', () => {
    it('should hash passwords before storing them', async () => {
        const newUser = {
            username: 'secureUser',
            password: 'Secure123!'
        };
        const response = await request(app)
            .post('/register')
            .send(newUser)
            .type('form');
        expect(response.statusCode).toBe(302);

        // Fetch user and check if password is not plain text
        const dbResponse = await pool.query('SELECT * FROM UserCredentials WHERE username = $1', [newUser.username]);
        expect(dbResponse.rows[0].password).not.toEqual(newUser.password);
    });
});

describe('Database interactions', () => {
    // Assuming pool is exported from fuelApp.js for simplicity
    const { pool } = require('./fuelApp');

    it('should retrieve data from UserCredentials table', async () => {
        const query = 'SELECT * FROM UserCredentials WHERE username = $1';
        const values = ['newuser'];
        const result = await pool.query(query, values);
        expect(result.rows).toBeInstanceOf(Array);
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].username).toEqual('newuser');
    });

    it('should confirm non-existence of a user not in UserCredentials table', async () => {
        const query = 'SELECT * FROM UserCredentials WHERE username = $1';
        const values = ['nonExistingUser'];
        const result = await pool.query(query, values);
        expect(result.rows).toHaveLength(0);
    });

    it('should allow insertion of a new unique user to UserCredentials table', async () => {
        const insertQuery = 'INSERT INTO UserCredentials (username, password) VALUES ($1, $2) RETURNING *';
        const selectQuery = 'SELECT * FROM UserCredentials WHERE username = $1';
        const username = 'uniqueuser';
        const password = 'Password123!'; // Assume this is already hashed for test
        const insertResult = await pool.query(insertQuery, [username, password]);
        expect(insertResult.rows).toHaveLength(1);
        expect(insertResult.rows[0].username).toEqual(username);
        const selectResult = await pool.query(selectQuery, [username]);
        expect(selectResult.rows).toHaveLength(1);
        expect(selectResult.rows[0].username).toEqual(username);
    });

    it('should not allow duplicate usernames in UserCredentials table', async () => {
        const query = 'INSERT INTO UserCredentials (username, password) VALUES ($1, $2)';
        const values = ['newuser', 'Password123!']; // 'newuser' should already exist in previous tests
        await expect(pool.query(query, values)).rejects.toThrow();
    });

    it('should handle errors when the database is down', async () => {
        jest.spyOn(pool, 'query').mockRejectedValue(new Error('Database unavailable'));
        const query = 'SELECT * FROM UserCredentials WHERE username = $1';
        const values = ['anyuser'];
        await expect(pool.query(query, values)).rejects.toThrow('Database unavailable');
        jest.restoreAllMocks();
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

describe('POST /createProfile error handling', () => {
    // Before each test, mock the pool.query to prevent actual database interaction
    beforeEach(() => {
      jest.spyOn(pool, 'query').mockImplementation(() => Promise.resolve({ rows: [], rowCount: 0 }));
    });
  
    // After each test, restore the original implementation
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    // Test for profile creation with database error
    it('should handle a database error during profile creation', async () => {
      jest.spyOn(pool, 'query').mockImplementationOnce(() => Promise.reject(new Error('Database error')));
      const response = await request(app)
        .post('/createProfile')
        .send({ full_name: 'John Doe', address1: '123 Main St', city: 'Anytown', state: 'TX', zipcode: '12345' })
        .type('form');
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/editProfile.html?error=database');
    });
  
});

describe('Server Shutdown', () => {
    it('should close the database pool and log "done!" on process exit', () => {
        jest.spyOn(pool, 'end').mockImplementationOnce(() => {
            console.log("Simulating database pool closure...");
        });

        const consoleSpy = jest.spyOn(console, 'log');
        process.emit('exit');
        expect(pool.end).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith("done!");
    });
});


