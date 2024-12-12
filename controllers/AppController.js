import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// Controller for handling application-level routes
class AppController {
  // Endpoint to get the status of Redis and MongoDB services
  static getStatus(request, response) {
    try {
      // Check if Redis is alive
      const redis = redisClient.isAlive();

      // Check if MongoDB is alive
      const db = dbClient.isAlive();

      // Send status response with Redis and DB health
      response.status(200).send({ redis, db });
    } catch (error) {
      // Log any errors that occur during status check
      console.log(error);
    }
  }

  // Endpoint to get statistics about users and files
  static async getStats(request, response) {
    try {
      // Fetch the number of users from MongoDB
      const users = await dbClient.nbUsers();

      // Fetch the number of files from MongoDB
      const files = await dbClient.nbFiles();

      // Send response with user and file counts
      response.status(200).send({ users, files });
    } catch (error) {
      // Log any errors that occur during statistics fetching
      console.log(error);
    }
  }
}

export default AppController;
