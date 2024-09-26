// Initialize the map
const map = L.map('map').setView([0, 0], 2); // Default view at coordinates (0, 0)

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Get user's location and device details
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const userAgent = navigator.userAgent;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        const userInfo = {
            latitude: lat,
            longitude: lon,
            userAgent: userAgent,
            screenWidth: screenWidth,
            screenHeight: screenHeight,
        };

        document.getElementById('location').innerText = `Your Location: Latitude ${lat}, Longitude ${lon}`;
        
        // Log location and device details to local storage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // Add a marker for the user's location on the map
        L.marker([lat, lon]).addTo(map).bindPopup('You are here!').openPopup();
        
        console.log(`User's Location: Latitude ${lat}, Longitude ${lon}, User Agent: ${userAgent}, Screen Size: ${screenWidth}x${screenHeight}`);
        
        // Optionally send this data to your SQL server database
        sendLocationToServer(userInfo);
        
    }, error => {
        console.error('Error getting location', error);
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}

// Function to send user info to your server
function sendLocationToServer(userInfo) {
    fetch('https://your-server-endpoint.com/log', { // Replace with your actual server endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
    })
    .then(response => response.json())
    .then(data => console.log('Data logged successfully:', data))
    .catch((error) => console.error('Error logging data:', error));
}