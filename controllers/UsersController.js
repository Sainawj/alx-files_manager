import dbClient from '../utils/db.js';
import crypto from 'crypto';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists
    const userCollection = dbClient.db.collection('users');
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    // Insert the new user into the database
    const newUser = { email, password: hashedPassword };
    const result = await userCollection.insertOne(newUser);

    // Return the new user with only id and email
    return res.status(201).json({ id: result.insertedId, email });
  }
}

export default UsersController;
