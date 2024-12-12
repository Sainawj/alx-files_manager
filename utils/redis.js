import { createClient } from 'redis'; // Import the Redis client creation function
import { promisify } from 'util'; // Import the promisify function to convert Redis callbacks to promises

// Class to define methods for commonly used Redis commands
class RedisClient {
  constructor() {
    // Create a Redis client and handle connection errors
    this.client = createClient();
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to server: ${error}`); // Log errors if Redis is not connected
    });
  }

  // Check if the connection to the Redis server is alive
  isAlive() {
    if (this.client.connected) {
      return true; // Return true if connected
    }
    return false; // Return false if not connected
  }

  // Asynchronously get the value for a given key from the Redis server
  async get(key) {
    const redisGet = promisify(this.client.get).bind(this.client); // Promisify the 'get' method to return a promise
    const value = await redisGet(key); // Fetch the value associated with the key
    return value; // Return the retrieved value
  }

  // Asynchronously set a key-value pair to the Redis server with an expiration time
  async set(key, value, time) {
    const redisSet = promisify(this.client.set).bind(this.client); // Promisify the 'set' method
    await redisSet(key, value); // Set the key-value pair in Redis
    await this.client.expire(key, time); // Set the expiration time for the key
  }

  // Asynchronously delete a key-value pair from the Redis server
  async del(key) {
    const redisDel = promisify(this.client.del).bind(this.client); // Promisify the 'del' method
    await redisDel(key); // Delete the key-value pair from Redis
  }
}

// Create an instance of RedisClient to manage Redis operations
const redisClient = new RedisClient();

// Export the redisClient instance for use in other parts of the application
module.exports = redisClient;
