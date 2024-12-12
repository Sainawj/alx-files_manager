import express from 'express';  // Import the Express framework
import routes from './routes';   // Import the routes module for handling various endpoints

const app = express();  // Create an Express application instance
const PORT = process.env.PORT || 5000;  // Set the port from environment variable or default to 5000

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Load the routes, setting the base path as '/'
app.use('/', routes);

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);  // Log a message when the server starts successfully
});