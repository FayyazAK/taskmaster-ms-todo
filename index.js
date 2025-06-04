const app = require("./src/app");
const config = require("./src/config/env");
const { connectDB } = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServer = require("./src/config/server");
const logger = require("./src/utils/logger");
const KafkaHandler = require("./src/services/kafkaHandler");

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("Connected to Todo database!");

    // Initialize database
    await initializeDatabase();

    // Initialize Kafka handler
    await KafkaHandler.initialize();

    // Create server based on configuration
    const server = createServer(app);

    if (config.ssl.enabled) {
      logger.info(`Todo service running on HTTPS port ${config.ssl.port}`);
    } else {
      logger.info(`Todo service running on HTTP port ${config.server.port}`);
    }
  } catch (error) {
    logger.error("Failed to start Todo service:", error);
    process.exit(1);
  }
}

startServer();
