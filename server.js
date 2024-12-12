import express from 'express'; // Import the express framework
import router from './routes/index'; // Import the router from the 'routes' directory

// Set the port from environment variables or default to 5000
const port = parseInt(process.env.PORT, 10) || 5000;

const app = express(); // Create a new express application

// Middleware to parse incoming JSON requests
app.use(express.json());

// Use the imported router for all routes starting with '/'
app.use('/', router);

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`server running on port ${port}`); // Log when the server is running
});

export default app; // Export the app for testing or other purposes
