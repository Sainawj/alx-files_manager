import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AppController {
  // GET /status
  static async getStatus(req, res) {
    try {
      const redisAlive = await redisClient.isAlive();
      const dbAlive = dbClient.isAlive();

      console.log('Redis status:', redisAlive); // Log Redis status
      console.log('DB status:', dbAlive); // Log DB status

      res.status(200).json({ redis: redisAlive, db: dbAlive });
    } catch (error) {
      console.error('Error in getStatus:', error); // Log errors in getStatus
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /stats
  static async getStats(req, res) {
    try {
      const numUsers = await dbClient.nbUsers();
      const numFiles = await dbClient.nbFiles();

      console.log('Number of users:', numUsers); // Log number of users
      console.log('Number of files:', numFiles); // Log number of files

      res.status(200).json({ users: numUsers, files: numFiles });
    } catch (error) {
      console.error('Error in getStats:', error); // Log errors in getStats
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AppController;

