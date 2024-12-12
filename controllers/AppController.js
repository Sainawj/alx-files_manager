// Importing database client and Redis client from utility files
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// Define the AppController with methods to handle requests
const AppController = {

  // Method to check the status of Redis and Database connections
  async getStatus(req, res) {
    // Check if Redis and Database are alive
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    // If both services are alive, return a 200 status with true values for both
    if (redisStatus && dbStatus) {
      res.status(200).json({ redis: true, db: true });
    } else {
      // If either service is down, return a 500 status with the actual status of each service
      res.status(500).json({ redis: redisStatus, db: dbStatus });
    }
  },

  // Method to fetch statistics related to users and files
  async getStats(req, res) {
    try {
      // Fetch the count of users and files from the database asynchronously
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      // Return the statistics with a 200 status
      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      // If there's an error during fetching, return a 500 status with an error message
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

// Export the AppController to be used in other parts of the application
export default AppController;