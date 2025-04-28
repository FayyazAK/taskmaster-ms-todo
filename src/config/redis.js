// config/redis.js
const Redis = require("ioredis");
const config = require("./env");

const redisClient = new Redis({
  host: config.REDIS.HOST || "localhost",
  port: config.REDIS.PORT || 6379,
  password: config.REDIS.PASSWORD || "",
  db: config.REDIS.DB || 0,
  keyPrefix: "taskmaster:",
  // Reconnect strategy
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  console.log("Connected to Redis server");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Cache helper functions
const cacheHelpers = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key, data) {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", config.REDIS.TTL);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
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
      console.error(
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
      console.error(`Error deleting cache for user ${userId}:`, error);
    }
  },

  async clear() {
    try {
      await redisClient.flushdb();
    } catch (error) {
      console.error("Cache clear error:", error);
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
      console.log("Successfully cleared all lists and tasks cache");
    } catch (error) {
      console.error("Error clearing all lists and tasks cache:", error);
    }
  },
};

const keyGenerators = {
  // List keys
  list: (listId, userId) => `users:${userId}:lists:${listId}`,
  listWithTasks: (listId, userId) =>
    `users:${userId}:lists:${listId}:withTasks`,
  userLists: (userId) => `users:${userId}:lists`,
  userListsWithTasks: (userId) => `users:${userId}:lists:withTasks`,

  // Task keys
  task: (taskId, userId) => `users:${userId}:tasks:${taskId}`,
  listTasks: (listId, userId) => `users:${userId}:lists:${listId}:tasks`,
  userTasks: (userId) => `users:${userId}:tasks`,

  // Priority keys
  priorities: () => `priorities`,
  priority: (priorityId) => `priorities:${priorityId}`,
};

module.exports = {
  redisClient,
  cacheHelpers,
  keyGenerators,
};
