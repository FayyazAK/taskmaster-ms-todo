const kafkaConsumer = require("./kafkaConsumer");
const logger = require("../utils/logger");
const MSG = require("../utils/messages");
const ListService = require("./listService");

class KafkaHandler {
  static async handleDeleteUserData(payload) {
    try {
      if (!payload.userId) {
        logger.error(MSG.UNAUTHORIZED);
      }
      await ListService.deleteAllLists(payload.userId);
      logger.info(MSG.LISTS_DELETED);
    } catch (error) {
      logger.error("Error in handleDeleteUserData:", error.message);
    }
  }

  static async initialize() {
    try {
      await kafkaConsumer.connect();
      await kafkaConsumer.subscribe("user.delete", async (payload) => {
        await this.handleDeleteUserData(payload);
      });
      logger.info("Kafka handler initialized successfully");
    } catch (error) {
      logger.error(MSG.SERVICE_UNAVAILABLE, error);
    }
  }
}

module.exports = KafkaHandler;
