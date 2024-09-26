const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // Import the fs module
const path = require('path'); // Import the path module
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

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

                        // Send the data to the server
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
app.post('/log', (req, res) => {
    const { latitude, longitude, userAgent, screenWidth, screenHeight } = req.body;

    // Prepare log entry
    const logEntry = {
        latitude,
        longitude,
        userAgent,
        screenWidth,
        screenHeight,
        timestamp: new Date().toISOString() // Add a timestamp
    };

    // Define the path to the log file
    const logFilePath = path.join(__dirname, 'location_logs.txt');

    // Append log entry to the file
    fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500).send({ message: 'Error logging data', error: err.message });
        }
        
        res.status(200).send({ 
            message: 'Data logged successfully' 
        });
    });
});

// Start the server on port 3001
const PORT = process.env.PORT || 3001; // Use PORT from environment or default to 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});