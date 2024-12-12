import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// Controller to manage user-related actions, such as creating a new user and retrieving user details
class UsersController {
  // Method to create a new user
  static async postNew(request, response) {
    // Extract email and password from the request body
    const { email, password } = request.body;

    // Check if email is missing, respond with an error if true
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
    }

    // Check if password is missing, respond with an error if true
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
    }

    // Hash the password using SHA-1 for storage
    const hashPwd = sha1(password);

    try {
      // Access the 'users' collection in the database
      const collection = dbClient.db.collection('users');

      // Check if a user with the same email already exists
      const user1 = await collection.findOne({ email });

      if (user1) {
        // Respond with an error if the user already exists
        response.status(400).json({ error: 'Already exist' });
      } else {
        // Insert a new user record into the database
        collection.insertOne({ email, password: hashPwd });

        // Retrieve the newly created user's email and ID
        const newUser = await collection.findOne(
          { email },
          { projection: { email: 1 } }
        );

        // Respond with the new user's ID and email
        response.status(201).json({ id: newUser._id, email: newUser.email });
      }
    } catch (error) {
      // Log any server errors and respond with a generic server error message
      console.log(error);
      response.status(500).json({ error: 'Server error' });
    }
  }

  // Method to retrieve user details based on the authentication token
  static async getMe(request, response) {
    try {
      // Extract the authentication token from the request headers
      const userToken = request.header('X-Token');

      // Construct the Redis key for authentication
      const authKey = `auth_${userToken}`;

      // Retrieve the user ID associated with the token from Redis
      const userID = await redisClient.get(authKey);

      if (!userID) {
        // Respond with an error if the user is not authenticated
        response.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch user details from the database using the retrieved user ID
      const user = await dbClient.getUser({ _id: ObjectId(userID) });

      // Respond with the user's ID and email
      response.json({ id: user._id, email: user.email });
    } catch (error) {
      // Log any server errors and respond with a generic server error message
      console.log(error);
      response.status(500).json({ error: 'Server error' });
    }
  }
}

export default UsersController;
