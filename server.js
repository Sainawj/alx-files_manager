import express from 'express';
import routes from './routes/index.js';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Load all routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

