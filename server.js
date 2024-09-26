const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const fs = require('fs'); // Import the fs module
const path = require('path'); // Import the path module
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Define a root route
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Location Logger</title>
                <script>
                    function getLocation() {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(sendLocation, showError);
                        } else {
                            alert("Geolocation is not supported by this browser.");
                        }
                    }

                    function sendLocation(position) {
                        const data = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            userAgent: navigator.userAgent,
                            screenWidth: window.screen.width,
                            screenHeight: window.screen.height
                        };

                        fetch('/log', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        })
                        .then(response => response.json())
                        .then(data => console.log(data))
                        .catch(error => console.error('Error:', error));
                    }

                    function showError(error) {
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                alert("User denied the request for Geolocation.");
                                break;
                            case error.POSITION_UNAVAILABLE:
                                alert("Location information is unavailable.");
                                break;
                            case error.TIMEOUT:
                                alert("The request to get user location timed out.");
                                break;
                            case error.UNKNOWN_ERROR:
                                alert("An unknown error occurred.");
                                break;
                        }
                    }

                    window.onload = getLocation; // Call getLocation on page load
                </script>
            </head>
            <body>
                <h1>Location Logger</h1>
                <p>Checking location...</p>
            </body>
        </html>
    `);
});

// Endpoint to log user information
app.post('/log', async (req, res) => {
    try {
        const { latitude, longitude, userAgent, screenWidth, screenHeight } = req.body;

        // Generate Google Maps link
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        const pool = await sql.connect(config);
        await pool.request()
            .input('Latitude', sql.Float, latitude)
            .input('Longitude', sql.Float, longitude)
            .input('UserAgent', sql.NVarChar(255), userAgent)
            .input('ScreenWidth', sql.Int, screenWidth)
            .input('ScreenHeight', sql.Int, screenHeight)
            .input('GoogleMapsLink', sql.NVarChar(255), googleMapsLink)
            .query(`
                INSERT INTO UserLocations (Latitude, Longitude, UserAgent, ScreenWidth, ScreenHeight, GoogleMapsLink) 
                VALUES (@Latitude, @Longitude, @UserAgent, @ScreenWidth, @ScreenHeight, @GoogleMapsLink)
            `);

        res.status(200).send({ 
            message: 'Data logged successfully', 
            googleMapsLink 
        });
    } catch (err) {
        console.error('Error logging data:', err);
        res.status(500).send({ message: 'Error logging data', error: err.message });
    }
});

// Start the server on port 3001
const PORT = process.env.PORT || 3001; // Use PORT from environment or default to 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});