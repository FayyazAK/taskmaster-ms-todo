// config/redis.js
const Redis = require("ioredis");
const config = require("./env");
const logger = require("../utils/logger");

const redisClient = new Redis({
  host: config.REDIS.HOST,
  port: config.REDIS.PORT,
  password: config.REDIS.PASSWORD,
  db: config.REDIS.DB,
  keyPrefix: "authService:",
  // Reconnect strategy
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis server");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

// Cache helper functions
const cacheHelpers = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key, data) {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", config.REDIS.TTL);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  },

  async deleteByPattern(pattern) {
    try {
      // Add the keyPrefix to the pattern
      const fullPattern = `${redisClient.options.keyPrefix}${pattern}`;
      const keys = await redisClient.keys(fullPattern);
      if (keys.length > 0) {
        // Remove the keyPrefix from keys before deleting
        const keysWithoutPrefix = keys.map((key) =>
          key.replace(redisClient.options.keyPrefix, "")
        );
        await redisClient.del(keysWithoutPrefix);
      }
    } catch (error) {
      logger.error(
        `Cache delete by pattern error for pattern ${pattern}:`,
        error
      );
    }
  },

  async deleteUserCache(userId) {
    try {
      // Delete all user-related cache using patterns
      const pattern = `users:${userId}*`;
      await this.deleteByPattern(pattern);
    } catch (error) {
      logger.error(`Error deleting cache for user ${userId}:`, error);
    }
  },

  async clear() {
    try {
      // Only clear keys with our prefix
      const keys = await redisClient.keys(`${redisClient.options.keyPrefix}*`);
      if (keys.length > 0) {
        const keysWithoutPrefix = keys.map((key) =>
          key.replace(redisClient.options.keyPrefix, "")
        );
        await redisClient.del(keysWithoutPrefix);
      }
      logger.info("Auth service cache cleared");
    } catch (error) {
      logger.error("Cache clear error:", error);
    }
  },

  async clearAllListsAndTasks() {
    try {
      // Delete all lists and tasks using patterns
      const patterns = [
        "users:*:lists:*", // Matches all lists
        "users:*:tasks:*", // Matches all tasks
      ];

      for (const pattern of patterns) {
        await this.deleteByPattern(pattern);
      }
      logger.info("Successfully cleared all lists and tasks cache");
    } catch (error) {
      logger.error("Error clearing all lists and tasks cache:", error);
    }
  },
};

const keyGenerators = {
  // User keys
  user: (userId) => `users:${userId}`,
  users: () => "users",
};

module.exports = {
  redisClient,
  cacheHelpers,
  keyGenerators,
};
