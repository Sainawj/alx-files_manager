// server.js
import express from 'express'; // Import the express library
import router from './routes/index.js'; // Import routes from the 'routes' directory

// Set the port from environment variable or default to 5000
const port = process.env.PORT || 5000;

const app = express(); // Initialize express app

// Use JSON middleware for parsing JSON requests
app.use(express.json());

// Use the router for handling all routes from '/routes/index.js'
app.use('/', router);

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app; // Export the app for possible testing
