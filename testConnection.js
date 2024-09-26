const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// SQL Server configuration using environment variables
const config = {
    user: process.env.DB_USER, // Database username from .env
    password: process.env.DB_PASSWORD, // Database password from .env
    server: process.env.DB_SERVER, // Database server from .env
    database: process.env.DB_DATABASE, // Database name from .env
    options: {
        encrypt: true, // Use this if you're on Azure
        trustServerCertificate: true, // Trust self-signed certificates (for local dev)
        enableArithAbort: true // Recommended for Azure SQL Database
    }
};

// Endpoint to log user information
app.post('/log', async (req, res) => {
    try {
        const { latitude, longitude, userAgent, screenWidth, screenHeight } = req.body;

        // Generate Google Maps link
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        // Connect to the SQL Server database
        const pool = await sql.connect(config);

        // Execute the insert query with parameters
        await pool.request()
            .input('Latitude', sql.Float, latitude)
            .input('Longitude', sql.Float, longitude)
            .input('UserAgent', sql.NVarChar(255), userAgent)
            .input('ScreenWidth', sql.Int, screenWidth)
            .input('ScreenHeight', sql.Int, screenHeight)
            .input('GoogleMapsLink', sql.NVarChar(255), googleMapsLink) // Add Google Maps link as input
            .query('INSERT INTO UserLocations (Latitude, Longitude, UserAgent, ScreenWidth, ScreenHeight, GoogleMapsLink) VALUES (@Latitude, @Longitude, @UserAgent, @ScreenWidth, @ScreenHeight, @GoogleMapsLink)');

        // Send success response with the Google Maps link
        res.status(200).send({ 
            message: 'Data logged successfully', 
            googleMapsLink // Send the generated link back in the response
        });
    } catch (err) {
        console.error('Error logging data:', err); // Log the error for debugging
        res.status(500).send({ message: 'Error logging data', error: err.message }); // Send back error message
    }
});

// Start the server on port 3001
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});