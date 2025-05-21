const rabbit = require('../config/rabbbitmq');
const logger = require('../utils/logger');

class RabbitMQConsumer {
  async connect() {
    try {
      await rabbit.connect();
      logger.info('🐇 RabbitMQ consumer connected successfully');
    } catch (error) {
      logger.error('🐇 Error connecting RabbitMQ consumer:', error);
      throw error;
    }
  }

  async subscribe(queue, handler) {
    try {
      await rabbit.subscribe(queue, handler);
      logger.info(`🐇 Subscribed to queue: ${queue}`);
    } catch (error) {
      logger.error(`🐇 Error subscribing to queue ${queue}:`, error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await rabbit.disconnect();
      logger.info('🐇 RabbitMQ consumer disconnected successfully');
    } catch (error) {
      logger.error('🐇 Error disconnecting RabbitMQ consumer:', error);
      throw error;
    }
  }
}

module.exports = new RabbitMQConsumer();
