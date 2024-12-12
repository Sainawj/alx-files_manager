import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode Base64 and split into email and password
    const base64Credentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = decodedCredentials.split(':');

    // Hash the password and find user in DB
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate token and store in Redis
    const token = uuidv4();
    const redisKey = `auth_${token}`;
    await redisClient.set(redisKey, user._id.toString(), 86400); // 24 hours in seconds

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    // Check if token exists in headers
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    const redisKey = `auth_${token}`;
    const deleted = await redisClient.del(redisKey);

    if (!deleted) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(204).send();
  }
}

export default AuthController;
