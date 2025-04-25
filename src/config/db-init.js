const User = require("../models/User");
const logger = require("../utils/logger");

async function initializeDatabase() {
  try {
    // Create user table
    await User.createTable();

    await User.initializeAdmin();

    logger.info("Auth service database initialized successfully!");
  } catch (error) {
    logger.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
