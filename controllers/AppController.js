// controllers/AppController.js
import redisClient from '../utils/redis'; // Import Redis client utility
import dbClient from '../utils/db'; // Import DB client utility

class AppController {
  // Endpoint to check the health status of Redis and the database
  static getStatus(req, res) {
    const redisStatus = redisClient.isAlive(); // Check Redis status
    const dbStatus = dbClient.isAlive(); // Check DB status
    
    // Respond with the health status of Redis and DB
    return res.status(200).json({
      redis: redisStatus, 
      db: dbStatus
    });
  }

  // Endpoint to get statistics about users and files from the database
  static async getStats(req, res) {
    try {
      // Fetch the total number of users and files from the database
      const usersNum = await dbClient.nbUsers();
      const filesNum = await dbClient.nbFiles();
      
      // Send the stats as a JSON response
      return res.status(200).json({
        users: usersNum, 
        files: filesNum
      });
    } catch (error) {
      // Handle errors and send a 500 status
      return res.status(500).json({ error: 'Unable to fetch stats' });
    }
  }
}

export default AppController; // Export the AppController class
