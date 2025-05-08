const PriorityService = require("../services/priorityService");
const { redisClient } = require("../config/redis");
const { sequelize } = require("../models");
async function initializeDatabase() {
  try {
    await sequelize.sync({ alter: true });
    // Initialize priority levels
    await PriorityService.initializePriorities();
    console.log("Database initialized successfully!");

    // Test Redis connection
    await redisClient.ping();
    console.log("Redis connection successful!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
