import redis from 'redis';  // Import redis library to interact with Redis server

class RedisClient {
  constructor() {
    // Create a new Redis client instance
    this.client = redis.createClient();

    // Event listener to log Redis client errors
    this.client.on('error', (error) => {
      console.error(`Redis client error: ${error}`);  // Log any errors in the Redis connection
    });
  }

  // Method to check if the Redis client is connected
  isAlive() {
    return this.client.connected;  // Returns true if the client is connected to Redis
  }

  // Method to get the value for a given key from Redis
  async get(key) {
    // Return a promise that resolves with the value or rejects with an error
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        if (error) {
          reject(error);  // Reject the promise if there's an error
        } else {
          resolve(reply);  // Resolve the promise with the retrieved value
        }
      });
    });
  }

  // Method to set a value for a given key in Redis with an expiration time
  async set(key, value, durationInSeconds) {
    // Return a promise that resolves once the value is set with the expiration time or rejects with an error
    return new Promise((resolve, reject) => {
      this.client.setex(key, durationInSeconds, value, (error, reply) => {
        if (error) {
          reject(error);  // Reject the promise if there's an error
        } else {
          resolve(reply);  // Resolve the promise with the reply
        }
      });
    });
  }

  // Method to delete a key from Redis
  async del(key) {
    // Return a promise that resolves once the key is deleted or rejects with an error
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, reply) => {
        if (error) {
          reject(error);  // Reject the promise if there's an error
        } else {
          resolve(reply);  // Resolve the promise with the reply
        }
      });
    });
  }
}

// Instantiate the RedisClient class and export the instance for use elsewhere
const redisClient = new RedisClient();

export default redisClient;