// Import the Redis client library and the promisify utility for converting callback-based functions to promises
const redis = require('redis');
const { promisify } = require('util');

// Define a class to encapsulate Redis client operations
class RedisClient {
  constructor() {
    // Initialize the Redis client instance
    this.client = redis.createClient();

    // Promisify the `get` method of the Redis client to use async/await syntax
    this.getAsync = promisify(this.client.get).bind(this.client);

    // Set up an event listener to handle Redis connection errors
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
  }

  // Check if the Redis client is connected to the server
  isAlive() {
    return this.client.connected; // Returns true if the client is connected
  }

  // Retrieve the value associated with a given key from Redis
  async get(key) {
    return this.getAsync(key); // Use the promisified `get` method
  }

  // Set a key-value pair in Redis with an expiration time (in seconds)
  async set(key, value, duration) {
    this.client.setex(key, duration, value); // Use the `setex` method to set a key with expiration
  }

  // Delete a key from Redis
  async del(key) {
    this.client.del(key); // Use the `del` method to remove a key
  }
}

// Create an instance of the RedisClient class
const redisClient = new RedisClient();

// Export the instance for use in other parts of the application
export default redisClient;
