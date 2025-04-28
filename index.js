const app = require("./src/app");
const config = require("./src/config/env");
const db = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServer = require("./src/config/server");
const logger = require("./src/utils/logger");

async function startServer() {
  try {
    // Test database connection
    await db.getConnection();
    logger.info("Connected to Todo database!");

    // Initialize database
    await initializeDatabase();

    // Create server based on configuration
    const server = createServer(app);

    if (config.SSL.enabled) {
      logger.info(`Todo service running on HTTPS port ${config.SSL.port}`);
    } else {
      logger.info(`Todo service running on HTTP port ${config.PORT}`);
    }
  } catch (error) {
    logger.error("Failed to start Todo service:", error);
    process.exit(1);
  }
}

startServer();
