import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.connect()
      .then(() => console.log('Redis client connected successfully'))
      .catch((err) => console.error('Failed to connect to Redis:', err));
  }

  /**
   * Sets a key-value pair in Redis with an expiration time
   * @param {string} key - The key to set in Redis
   * @param {string} value - The value associated with the key
   * @param {number} duration - Expiration time in seconds
   */
  async set(key, value, duration) {
    try {
      await this.client.setEx(key, duration, value);
    } catch (err) {
      console.error(`Error setting key ${key} in Redis:`, err);
    }
  }

  /**
   * Gets a value from Redis by key
   * @param {string} key - The key to retrieve from Redis
   * @returns {Promise<string|null>} - The value associated with the key, or null if not found
   */
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error(`Error getting key ${key} from Redis:`, err);
      return null;
    }
  }

  /**
   * Deletes a key from Redis
   * @param {string} key - The key to delete
   * @returns {Promise<number>} - 1 if the key was deleted, 0 if the key was not found
   */
  async del(key) {
    try {
      return await this.client.del(key);
    } catch (err) {
      console.error(`Error deleting key ${key} from Redis:`, err);
      return 0;
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
