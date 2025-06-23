const app = require("./src/app");
const config = require("./src/config/env");
const initializeDatabase = require("./src/config/db-init");
const createServer = require("./src/config/server");
const logger = require("./src/utils/logger");
const { sequelize } = require("./src/models");
const KafkaHandler = require("./src/services/kafkaHandler");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectWithRetry(maxRetries = 3, delayMs = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info("Connecting to Todo database...");
      await sequelize.authenticate();
      logger.info("Connected to Todo database!");
      return true;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      logger.info(`Retrying in ${delayMs/1000} seconds...`);
      await sleep(delayMs);
    }
  }
  return false;
}

async function startServer() {
  try {
    // Test database connection with retry
    try {
      await connectWithRetry();
    } catch (error) {
      logger.error("All database connection attempts failed:", error);
      process.exit(1);
    }

    // Initialize database
    await initializeDatabase();

    // Initialize Kafka handler
    await KafkaHandler.initialize();
    logger.info("Kafka handler initialized successfully");

    // Create server based on configuration
    const server = createServer(app);

  } catch (error) {
    logger.error("Failed to start Todo service:", error);
    process.exit(1);
  }
}

startServer();
