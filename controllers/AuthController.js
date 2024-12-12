// Importing the uuid module for generating unique tokens and clients for Redis and the database
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {

  // Method to handle user login and generate an authentication token
  static async getConnect(req, res) {
    try {
      // Extracting the 'Authorization' header and decoding the base64-encoded credentials
      const auth = req.headers.authorization.replace('Basic ', '');
      const authDecoded = Buffer.from(auth, 'base64').toString('utf-8');
      // Splitting the decoded credentials into email and password
      const [email, password] = authDecoded.split(':');

      // Searching for the user in the database with the provided email and password
      const user = await dbClient.db.collection('users').findOne({ email, password });

      // If the user is not found, return a 401 Unauthorized error
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a unique authentication token
      const token = uuidv4();
      // Store the token in Redis with an expiration time of 86400 seconds (24 hours)
      await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 86400);

      // Return the token to the user in the response
      return res.status(200).json({ token });
    } catch (error) {
      // Log the error and return a 500 Internal Server Error response
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Method to handle user logout and invalidate the authentication token
  static async getDisconnect(req, res) {
    try {
      // Extracting the token from the request headers
      const { token } = req.headers;
      // Retrieving the associated user ID from Redis using the token
      const userId = await redisClient.get(`auth_${token}`);

      // If no user ID is found, return a 401 Unauthorized error
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis to log out the user
      await redisClient.del(`auth_${token}`);

      // Return a 204 No Content response, indicating successful logout
      return res.status(204).send();
    } catch (error) {
      // Log the error and return a 500 Internal Server Error response
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

// Export the AuthController for use in other parts of the application
export default AuthController;