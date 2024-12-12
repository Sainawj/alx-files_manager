import express from 'express';
import router from './routes/index.js'; // Import router

const port = process.env.PORT || 5000;
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Use the imported router
app.use('/', router);

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app; // Export for possible testing
