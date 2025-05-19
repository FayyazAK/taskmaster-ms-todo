const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const logger = require('../utils/logger');
const errorHandler = (err, req, res, next) => {
  logger.error(err);
  res
    .status(STATUS.INTERNAL_SERVER_ERROR)
    .json({ message: MSG.INTERNAL_SERVER_ERROR });
};

module.exports = errorHandler;
