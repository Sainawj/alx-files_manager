import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AppController {
  static async getStatus(req, res) {
    // Check Redis and DB status
    const redisStatus = await redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    return res.status(200).json({
      redis: redisStatus,
      db: dbStatus,
    });
  }

  static async getStats(req, res) {
    // Fetch stats for users and files
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    return res.status(200).json({
      users: usersCount,
      files: filesCount,
    });
  }
}

export default AppController;
