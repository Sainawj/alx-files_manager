import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Initialize the Redis client
    this.client = createClient();
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to server: ${error}`);
    });
  }

  // Method to check if Redis is alive
  isAlive() {
    // Check connection status using a command like 'ping'
    return new Promise((resolve, reject) => {
      this.client.ping((err, res) => {
        if (err) reject(err);
        resolve(res === 'PONG'); // 'PONG' response means Redis is alive
      });
    });
  }

  // Promisified get method
  async get(key) {
    const redisGet = promisify(this.client.get).bind(this.client);
    const value = await redisGet(key);
    return value;
  }

  // Promisified set method with expiration
  async set(key, value, time) {
    const redisSet = promisify(this.client.set).bind(this.client);
    await redisSet(key, value);
    await this.client.expire(key, time);
  }

  // Promisified delete method
  async del(key) {
    const redisDel = promisify(this.client.del).bind(this.client);
    await redisDel(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
