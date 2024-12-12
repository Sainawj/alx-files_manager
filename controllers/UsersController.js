import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// Create a new Bull queue for processing user-related tasks
const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
  // Handles user registration
  static postNew(request, response) {
    const { email } = request.body; // Extract email from request body
    const { password } = request.body; // Extract password from request body

    // Validate if email is provided
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }
    // Validate if password is provided
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }

    const users = dbClient.db.collection('users'); // Get reference to users collection
    // Check if a user with the provided email already exists
    users.findOne({ email }, (err, user) => {
      if (user) {
        response.status(400).json({ error: 'Already exist' }); // Return error if user exists
      } else {
        const hashedPassword = sha1(password); // Hash the provided password
        // Insert a new user into the database
        users.insertOne(
          {
            email,
            password: hashedPassword,
          },
        ).then((result) => {
          response.status(201).json({ id: result.insertedId, email }); // Respond with new user's ID and email
          userQueue.add({ userId: result.insertedId }); // Add user creation task to the queue
        }).catch((error) => console.log(error)); // Log any database errors
      }
    });
  }

  // Handles fetching the currently authenticated user
  static async getMe(request, response) {
    const token = request.header('X-Token'); // Extract token from request header
    const key = `auth_${token}`; // Create Redis key for the token
    const userId = await redisClient.get(key); // Retrieve the user ID from Redis
    if (userId) {
      const users = dbClient.db.collection('users'); // Get reference to users collection
      const idObject = new ObjectID(userId); // Convert user ID to MongoDB ObjectID
      // Find user in the database by their ID
      users.findOne({ _id: idObject }, (err, user) => {
        if (user) {
          response.status(200).json({ id: userId, email: user.email }); // Respond with user ID and email
        } else {
          response.status(401).json({ error: 'Unauthorized' }); // Respond with an unauthorized error if user not found
        }
      });
    } else {
      console.log('Hupatikani!'); // Log a debug message for missing token
      response.status(401).json({ error: 'Unauthorized' }); // Respond with an unauthorized error if token is invalid
    }
  }
}

// Export the UsersController for use in routing or other modules
module.exports = UsersController;
