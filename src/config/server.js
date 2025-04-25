const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const config = require("./env");
const logger = require("../utils/logger");

function createServers(app) {
  const servers = {};

  if (config.SSL.enabled) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, "..", config.SSL.key)),
        cert: fs.readFileSync(path.join(__dirname, "..", config.SSL.cert)),
      };

      servers.https = https.createServer(httpsOptions, app);
      servers.https.listen(config.SSL.port);
      logger.info(`HTTPS server running on port ${config.SSL.port}`);
    } catch (error) {
      logger.error(`Failed to start HTTPS server: ${error.message}`);
      logger.warn("Falling back to HTTP server only");
      servers.http = app.listen(config.PORT);
      logger.info(`HTTP server running on port ${config.PORT}`);
    }
  } else {
    servers.http = app.listen(config.PORT);
    logger.info(`HTTP server running on port ${config.PORT}`);
  }

  return servers;
}

module.exports = createServers;
