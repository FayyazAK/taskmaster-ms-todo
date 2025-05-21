const rabbitConsumer = require('./rabbitmqConsumer');
const logger = require('../utils/logger');
const MSG = require('../utils/messages');
const ListService = require('./listService');

class RabbitMQHandler {
  static async handleDeleteUserData(payload) {
    try {
      if (!payload.userId) {
        logger.error(MSG.UNAUTHORIZED);
        return;
      }
      await ListService.deleteAllLists(payload.userId);
      logger.info(MSG.LISTS_DELETED);
    } catch (error) {
      logger.error('🐇 Error in handleDeleteUserData:', error.message);
    }
  }

  static async initialize() {
    try {
      await rabbitConsumer.connect();
      await rabbitConsumer.subscribe('user.delete', async (payload) => {
        await this.handleDeleteUserData(payload);
      });
      logger.info('🐇 RabbitMQ handler initialized successfully');
    } catch (error) {
      logger.error(MSG.SERVICE_UNAVAILABLE, error);
    }
  }

  static async shutdown() {
    try {
      await rabbitConsumer.disconnect();
      logger.info('🐇 RabbitMQ handler shutdown complete');
    } catch (error) {
      logger.error('🐇 Error during RabbitMQ handler shutdown:', error);
    }
  }
}

module.exports = RabbitMQHandler;
