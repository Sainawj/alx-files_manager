import sha1 from 'sha1';  // Importing the sha1 hashing library to hash the password
import redisClient from '../utils/redis';  // Importing the Redis client for handling user session and token storage
import dbClient from '../utils/db';  // Importing the database client to interact with the MongoDB database

const { userQueue } = require('../worker');  // Importing the userQueue for background jobs related to user processing

class UsersController {
  // Method to handle new user creation
  static async postNew(req, res) {
    try {
      // Extract email and password from the request body
      const { email, password } = req.body;

      // Check if email is provided in the request body
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });  // Return an error if email is missing
      }

      // Check if password is provided in the request body
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });  // Return an error if password is missing
      }

      // Check if a user with the given email already exists in the database
      const userExists = await dbClient.db.collection('users').findOne({ email });

      // If user already exists, return an error
      if (userExists) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password using sha1 (note: it's recommended to use bcrypt for better security)
      const hashedPassword = sha1(password);

      // Create a new user object with the provided email and hashed password
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Insert the new user into the database
      const result = await dbClient.db.collection('users').insertOne(newUser);
      const { _id } = result.ops[0];  // Get the newly inserted user's ID

      // Add a background job to the userQueue for additional processing related to the user (e.g., sending a welcome email)
      await userQueue.add({ userId: _id });

      // Return a success response with the newly created user's ID and email
      return res.status(201).json({ id: _id, email });
    } catch (error) {
      console.error(error);  // Log any errors that occur
      return res.status(500).json({ error: 'Internal Server Error' });  // Return a generic server error
    }
  }

  // Method to retrieve the current user's information
  static async getMe(req, res) {
    try {
      // Extract the token from the request headers
      const { token } = req.headers;

      // Use the token to get the user ID from Redis (token-based authentication)
      const userId = await redisClient.get(`auth_${token}`);

      // If the user ID is not found in Redis, the user is not authenticated
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });  // Return an unauthorized error if token is invalid
      }

      // Retrieve the user from the database using the user ID
      const user = await dbClient.db.collection('users').findOne({ _id: userId });

      // If the user doesn't exist in the database, return an unauthorized error
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return the user's details (ID and email) in the response
      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.error(error);  // Log any errors that occur
      return res.status(500).json({ error: 'Internal Server Error' });  // Return a generic server error
    }
  }
}

export default UsersController;  // Export the UsersController class so it can be used in other parts of the application