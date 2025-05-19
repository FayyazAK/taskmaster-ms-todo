const PriorityService = require("../services/priorityService");
const { redisClient } = require("../config/redis");
const { sequelize } = require("../models");
const logger = require("../utils/logger");
async function initializeDatabase() {
  try {
    await sequelize.sync({ alter: false, force:false });
    // Initialize priority levels
    await PriorityService.initializePriorities();
    logger.info("Database initialized successfully!");

    // Test Redis connection
    await redisClient.ping();
    logger.info("Redis connection successful!");
  } catch (error) {
    logger.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
