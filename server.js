import express from 'express';
import router from './routes/index.js'; // Import the router

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Connect routes
app.use('/', router);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app; // Export for testing purposes
