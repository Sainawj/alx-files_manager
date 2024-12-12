import sha1 from 'sha1'; // Library for hashing passwords
import { v4 as uuidv4 } from 'uuid'; // Library for generating unique tokens
import redisClient from '../utils/redis'; // Redis client for session management
import dbClient from '../utils/db'; // Database client for accessing user data

// Controller for handling authentication-related actions
class AuthController {
  // Method to handle user login and generate an authentication token
  static async getConnect(request, response) {
    const authHeader = request.headers.authorization; // Retrieve the Authorization header

    // If Authorization header is missing, respond with an unauthorized error
    if (!authHeader) {
      response.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Decode the Basic authentication credentials (Base64 format)
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const email = auth[0]; // Extract email
      const pass = sha1(auth[1]); // Hash the provided password

      // Retrieve the user from the database by email
      const user = await dbClient.getUser({ email });

      if (!user) {
        // Respond with an unauthorized error if user does not exist
        response.status(401).json({ error: 'Unauthorized' });
      }

      if (pass !== user.password) {
        // Respond with an unauthorized error if password does not match
        response.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a unique token for the session
      const token = uuidv4();
      const key = `auth_${token}`; // Construct the Redis key for session storage
      const duration = (60 * 60 * 24); // Token validity duration (1 day)

      // Store the token in Redis with the user ID
      await redisClient.set(key, user._id.toString(), duration);

      // Respond with the generated token
      response.status(200).json({ token });
    } catch (err) {
      // Log any server errors and respond with a generic server error message
      console.log(err);
      response.status(500).json({ error: 'Server error' });
    }
  }

  // Method to handle user logout and invalidate the authentication token
  static async getDisconnect(request, response) {
    try {
      // Retrieve the token from the X-Token header
      const userToken = request.header('X-Token');

      // Retrieve the associated user ID from Redis
      const userKey = await redisClient.get(`auth_${userToken}`);

      if (!userKey) {
        // Respond with an unauthorized error if the token is invalid or missing
        response.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis to invalidate the session
      await redisClient.del(`auth_${userToken}`);

      // Respond with a 204 status code (No Content) to indicate successful logout
      response.status(204).send('Disconnected');
    } catch (err) {
      // Log any server errors and respond with a generic server error message
      console.log(err);
      response.status(500).json({ error: 'Server error' });
    }
  }
}

export default AuthController; // Export the AuthController class for use in the application
