const List = require("../models/List");
const Priority = require("../models/Priority");
const Task = require("../models/Task");
const { redisClient } = require("../config/redis");
async function initializeDatabase() {
  try {
    // Create tables in the correct order to handle foreign key dependencies
    await Priority.createTable();
    await List.createTable();
    await Task.createTable();

    // Initialize priority levels
    await Priority.initializePriorities();
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
