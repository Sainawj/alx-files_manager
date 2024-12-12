// server.js
import express from 'express'; // Import the express framework
import router from './routes/index'; // Import the router from the 'routes' directory

const port = parseInt(process.env.PORT, 10) || 5000; // Set the port from environment variables or default to 5000

const app = express(); // Create a new express application

app.use(express.json()); // Middleware to parse incoming JSON requests

app.use('/', router); // Use the imported router for all routes starting with '/'

app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Fixed template string syntax
});

export default app; // Export the app for testing or other purposes
