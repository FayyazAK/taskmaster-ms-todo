const app = require("./src/app");
const config = require("./src/config/env");
const initializeDatabase = require("./src/config/db-init");
const createServer = require("./src/config/server");
const logger = require("./src/utils/logger");
const { sequelize } = require("./src/models");
const RabbitMQHandler = require("./src/services/rabbitmqHandler");

let server;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Connected to Todo database!");

    // Initialize database
    await initializeDatabase();

    // Initialize RabbitMQ handler
    await RabbitMQHandler.initialize();

    // Create server based on configuration
    server = createServer(app);

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

async function shutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Set a timeout for the shutdown process
  const forceExitTimeout = setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000); // 30 seconds timeout
  
  try {
    // Close HTTP server
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
        logger.info('HTTP server closed');
      });
    }
    
    // Close RabbitMQ connections
    await RabbitMQHandler.shutdown();
    logger.info('RabbitMQ connections closed');
    
    // Close database connections
    await sequelize.close();
    logger.info('Database connections closed');
    
    clearTimeout(forceExitTimeout);
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
