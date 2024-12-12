import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });

    this.client.connect()
      .then(() => {
        this.db = this.client.db(DATABASE);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Check connection status
  isAlive() {
    return this.client.topology.isConnected(); // Check if MongoDB is connected
  }

  // Get number of users from MongoDB
  async nbUsers() {
    const users = this.db.collection('users');
    const usersNum = await users.countDocuments();
    return usersNum;
  }

  // Get number of files from MongoDB
  async nbFiles() {
    const files = this.db.collection('files');
    const filesNum = await files.countDocuments();
    return filesNum;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
