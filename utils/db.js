// Import the MongoClient class from the mongodb package
import { MongoClient } from 'mongodb';

// Retrieve database configuration values from environment variables, 
// with default fallbacks if not provided
const host = process.env.DB_HOST || 'localhost'; // Default to 'localhost'
const port = process.env.DB_PORT || 27017; // Default to MongoDB's default port (27017)
const database = process.env.DB_DATABASE || 'files_manager'; // Default to 'files_manager' database
const url = `mongodb://${host}:${port}/`; // Construct the MongoDB connection URL

// Define the DBClient class to handle database operations
class DBClient {
  constructor() {
    this.db = null; // Initialize the database connection property to null

    // Connect to the MongoDB server
    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
      if (error) console.log(error); // Log connection errors if any

      // Set the database connection to the specified database
      this.db = client.db(database);

      // Ensure 'users' and 'files' collections exist by creating them
      this.db.createCollection('users');
      this.db.createCollection('files');
    });
  }

  // Check if the database connection is established
  isAlive() {
    return !!this.db; // Returns true if this.db is not null or undefined
  }

  // Get the total number of documents in the 'users' collection
  async nbUsers() {
    return this.db.collection('users').countDocuments(); // Count documents in 'users'
  }

  // Retrieve a single user document from the 'users' collection based on a query
  async getUser(query) {
    console.log('QUERY IN DB.JS', query); // Log the query being executed
    const user = await this.db.collection('users').findOne(query); // Fetch a user matching the query
    console.log('GET USER IN DB.JS', user); // Log the retrieved user
    return user; // Return the user document
  }

  // Get the total number of documents in the 'files' collection
  async nbFiles() {
    return this.db.collection('files').countDocuments(); // Count documents in 'files'
  }
}

// Create an instance of the DBClient class
const dbClient = new DBClient();

// Export the instance for use in other parts of the application
export default dbClient;
