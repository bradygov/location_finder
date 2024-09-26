const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
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
            .input('GoogleMapsLink', sql.NVarChar(255), googleMapsLink) // Add Google Maps link as input
            .query(`
                INSERT INTO UserLocations (Latitude, Longitude, UserAgent, ScreenWidth, ScreenHeight, GoogleMapsLink) 
                VALUES (@Latitude, @Longitude, @UserAgent, @ScreenWidth, @ScreenHeight, @GoogleMapsLink)
            `);

        res.status(200).send({ 
            message: 'Data logged successfully', 
            googleMapsLink // Send the generated link back in the response
        });
    } catch (err) {
        console.error('Error logging data:', err);
        res.status(500).send({ message: 'Error logging data', error: err.message });
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});