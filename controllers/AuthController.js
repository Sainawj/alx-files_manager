import sha1 from 'sha1'; // Import sha1 for hashing passwords
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique tokens
import dbClient from '../utils/db'; // Import database client utility for database operations
import redisClient from '../utils/redis'; // Import Redis client utility for caching

class AuthController {
  // Endpoint to authenticate a user and provide a token
  static async getConnect(request, response) {
    const authData = request.header('Authorization'); // Retrieve the Authorization header
    let userEmail = authData.split(' ')[1]; // Extract the base64-encoded credentials
    const buff = Buffer.from(userEmail, 'base64'); // Decode base64-encoded credentials
    userEmail = buff.toString('ascii'); // Convert decoded buffer to string
    const data = userEmail.split(':'); // Split credentials into email and password

    if (data.length !== 2) { // Validate the presence of both email and password
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hashedPassword = sha1(data[1]); // Hash the password using sha1
    const users = dbClient.db.collection('users'); // Access the users collection in the database

    // Check if a user exists with the provided email and hashed password
    users.findOne({ email: data[0], password: hashedPassword }, async (err, user) => {
      if (user) {
        const token = uuidv4(); // Generate a unique token for the user
        const key = `auth_${token}`; // Create a key for storing the token in Redis
        await redisClient.set(key, user._id.toString(), 60 * 60 * 24); // Store the token with a 24-hour expiration
        response.status(200).json({ token }); // Respond with the token
      } else {
        response.status(401).json({ error: 'Unauthorized' }); // Respond with an error if authentication fails
      }
    });
  }

  // Endpoint to disconnect a user by invalidating their token
  static async getDisconnect(request, response) {
    const token = request.header('X-Token'); // Retrieve the token from the X-Token header
    const key = `auth_${token}`; // Create the Redis key for the token
    const id = await redisClient.get(key); // Check if the token exists in Redis

    if (id) {
      await redisClient.del(key); // Delete the token from Redis
      response.status(204).json({}); // Respond with a success status (no content)
    } else {
      response.status(401).json({ error: 'Unauthorized' }); // Respond with an error if the token is invalid
    }
  }
}

module.exports = AuthController; // Export the AuthController class
