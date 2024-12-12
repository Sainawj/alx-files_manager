// Import the express library for creating the web server
import express from 'express';

// Import the routing configuration (controllerRouting) for defining application routes
import controllerRouting from './routes/index';

// Initialize an express application instance
const app = express();

// Set the port from the environment variable or default to 5000 if not set
const port = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Set up the routing by passing the express app to the controllerRouting function
controllerRouting(app);

// Start the server on the specified port and log a message when the server is running
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export the app instance for testing or other purposes
export default app;

