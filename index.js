const app = require("./src/app");
const config = require("./src/config/env");
const db = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServers = require("./src/config/server");
const logger = require("./src/utils/logger");

async function startServer() {
  try {
    // Test database connection
    await db.getConnection();
    logger.info("Connected to Auth database!");

    // Initialize database
    await initializeDatabase();

    // Create HTTP and/or HTTPS servers based on configuration
    const servers = createServers(app);

    if (config.SSL.enabled) {
      logger.info(`Auth service running on HTTPS port ${config.SSL.port}`);
    } else {
      logger.info(`Auth service running on HTTP port ${config.PORT}`);
    }
  } catch (error) {
    logger.error("Failed to start Auth service:", error);
    process.exit(1);
  }
}

startServer();
