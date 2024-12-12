// controllers/AppController.js
import redisClient from '../utils/redis.js'; // Import Redis client
import dbClient from '../utils/db.js'; // Import DB client

class AppController {
  // Handle the /status route, checking the health of Redis and DB
  static async getStatus(req, res) {
    try {
      const redisStatus = redisClient.isAlive(); // Check if Redis is alive
      const dbStatus = dbClient.isAlive(); // Check if DB is alive

      // Return the status of Redis and DB as a JSON response
      return res.status(200).json({
        redis: redisStatus,
        db: dbStatus,
      });
    } catch (error) {
      console.error(error); // Log any errors
      return res.status(500).json({ error: 'Error checking system status' });
    }
  }

  // Handle the /stats route, fetching the number of users and files from the DB
  static async getStats(req, res) {
    try {
      // Get the number of users and files from the DB
      const usersNum = await dbClient.nbUsers();
      const filesNum = await dbClient.nbFiles();

      // Return the stats as a JSON response
      return res.status(200).json({
        users: usersNum,
        files: filesNum,
      });
    } catch (error) {
      console.error(error); // Log any errors
      return res.status(500).json({ error: 'Error fetching stats' });
    }
  }
}

export default AppController; // Export the controller
