import dbClient from '../utils/db.js';
import { createHash } from 'crypto';

class UsersController {
  // POST /users
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const usersCollection = dbClient.db.collection('users');

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password
      const hashedPassword = createHash('sha1').update(password).digest('hex');

      // Insert the new user
      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
      });

      // Return the new user details
      return res.status(201).json({ id: result.insertedId.toString(), email });
    } catch (error) {
      console.error('Error in UsersController.postNew:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
