import { MongoClient } from 'mongodb';  // Import MongoClient from MongoDB to interact with the database

class DBClient {
  constructor() {
    // Set default values for database connection if environment variables are not provided
    const {
      DB_HOST = 'localhost',  // Default host is localhost
      DB_PORT = 27017,        // Default port is 27017 (MongoDB default)
      DB_DATABASE = 'files_manager', // Default database is 'files_manager'
    } = process.env;

    // Initialize the class properties for database connection
    this.host = DB_HOST;
    this.port = DB_PORT;
    this.database = DB_DATABASE;

    // Create a connection URL using the provided or default database host, port, and name
    const url = `mongodb://${this.host}:${this.port}/${this.database}`;

    // Connect to MongoDB using the connection URL
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        // If connection fails, log the error
        console.error(`DB Connection Error: ${err}`);
        return;
      }
      // If the connection is successful, assign the database client to this.db
      this.db = client.db(this.database);
    });
  }

  // Method to check if the database connection is alive (initialized correctly)
  isAlive() {
    return !!this.db;  // Returns true if the database client is defined and connected
  }

  // Method to get the number of users in the 'users' collection
  async nbUsers() {
    if (!this.isAlive()) return 0;  // If database connection is not alive, return 0

    // Count and return the number of documents (users) in the 'users' collection
    return this.db.collection('users').countDocuments();
  }

  // Method to get the number of files in the 'files' collection
  async nbFiles() {
    if (!this.isAlive()) return 0;  // If database connection is not alive, return 0

    // Count and return the number of documents (files) in the 'files' collection
    return this.db.collection('files').countDocuments();
  }
}

// Instantiate the DBClient class and export the instance
const dbClient = new DBClient();

export default dbClient;