import { MongoClient } from 'mongodb';

// Define the database connection parameters, with fallback to default values.
const HOST = process.env.DB_HOST || 'localhost'; // Host of the database (default: localhost)
const PORT = process.env.DB_PORT || 27017; // Port for MongoDB (default: 27017)
const DATABASE = process.env.DB_DATABASE || 'files_manager'; // Name of the database (default: 'files_manager')

// Construct the MongoDB connection URL using the parameters.
const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    // Initialize the MongoClient with the connection URL and options.
    this.client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });

    // Connect to the MongoDB server and select the database.
    this.client.connect().then(() => {
      this.db = this.client.db(`${DATABASE}`); // Select the database after connection
    }).catch((err) => {
      console.log(err); // Log any connection errors
    });
  }

  // Check if the connection to the database is still active.
  isAlive() {
    return this.client.isConnected(); // Return the connection status (true/false)
  }

  // Asynchronously fetch the number of users in the 'users' collection.
  async nbUsers() {
    const users = this.db.collection('users'); // Reference the 'users' collection
    const usersNum = await users.countDocuments(); // Get the count of documents in the 'users' collection
    return usersNum; // Return the user count
  }

  // Asynchronously fetch the number of files in the 'files' collection.
  async nbFiles() {
    const files = this.db.collection('files'); // Reference the 'files' collection
    const filesNum = await files.countDocuments(); // Get the count of documents in the 'files' collection
    return filesNum; // Return the file count
  }
}

// Create an instance of the DBClient to manage database operations.
const dbClient = new DBClient();

// Export the dbClient instance for use in other parts of the application.
module.exports = dbClient;
