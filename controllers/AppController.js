import redisClient from '../utils/redis'; // Import Redis client utility for health checks
import dbClient from '../utils/db'; // Import database client utility for interacting with the database

class AppController {
  // Endpoint to check the health status of Redis and the database
  static getStatus(request, response) {
    response.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  // Endpoint to get statistics about users and files from the database
  static async getStats(request, response) {
    const usersNum = await dbClient.nbUsers(); // Fetch the total number of users
    const filesNum = await dbClient.nbFiles(); // Fetch the total number of files
    response.status(200).json({ users: usersNum, files: filesNum }); // Send the stats as a JSON response
  }
}

module.exports = AppController; // Export the AppController class