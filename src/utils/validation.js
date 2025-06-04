const mongoose = require("mongoose");
const STATUS = require("./statusCodes");
const MSG = require("./messages");

/**
 * Validates if a given ID is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @param {string} fieldName - The name of the field being validated (for error messages)
 * @returns {object|null} - Error object if invalid, null if valid
 */
const validateObjectId = (id, fieldName = "ID") => {
  if (!id) {
    return {
      message: `${fieldName} is required`,
      status: STATUS.BAD_REQUEST,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      message: `Invalid ${fieldName} format`,
      status: STATUS.BAD_REQUEST,
    };
  }

  return null;
};

/**
 * Validates multiple ObjectIds at once
 * @param {object} ids - Object containing id fields to validate
 * @returns {object|null} - Error object if any invalid, null if all valid
 */
const validateObjectIds = (ids) => {
  for (const [fieldName, id] of Object.entries(ids)) {
    const error = validateObjectId(id, fieldName);
    if (error) {
      return error;
    }
  }
  return null;
};

module.exports = {
  validateObjectId,
  validateObjectIds,
}; 