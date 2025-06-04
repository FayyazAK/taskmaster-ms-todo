const PriorityService = require("../services/priorityService");
const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const { validateObjectId } = require("../utils/validation");
const logger = require('../utils/logger');

// Get all priority levels
const getAllPriorities = async (req, res, next) => {
  try {
    const priorities = await PriorityService.getPriorities();
    return res.success(priorities, MSG.PRIORITIES_RETRIEVED, STATUS.OK);
  } catch (error) {
    logger.error("Error in getAllPriorities:", error);
    return next(error);
  }
};

// Get priority by ID
const getPriorityById = async (req, res, next) => {
  try {
    const { priority_id } = req.params;

    // Validate priority_id
    const priorityIdError = validateObjectId(priority_id, "Priority ID");
    if (priorityIdError) {
      return res.error(priorityIdError.message, priorityIdError.status);
    }

    // Get priority
    const priority = await PriorityService.getPriorityById(priority_id);

    if (!priority) {
      return res.error(MSG.PRIORITY_NOT_FOUND, STATUS.NOT_FOUND);
    }

    return res.success(priority, MSG.PRIORITY_RETRIEVED, STATUS.OK);
  } catch (error) {
    logger.error("Error in getPriorityById:", error);
    return next(error);
  }
};

// Get priority by level
const getPriorityByLevel = async (req, res, next) => {
  try {
    const { level } = req.params;

    // Validate level
    const parsedLevel = parseInt(level);
    if (isNaN(parsedLevel)) {
      return res.error(MSG.INVALID_PRIORITY_LEVEL, STATUS.BAD_REQUEST);
    }

    // Get priority
    const priority = await PriorityService.getPriorityByLevel(parsedLevel);

    if (!priority) {
      return res.error(MSG.PRIORITY_NOT_FOUND, STATUS.NOT_FOUND);
    }

    return res.success(priority, MSG.PRIORITY_RETRIEVED, STATUS.OK);
  } catch (error) {
    logger.error("Error in getPriorityByLevel:", error);
    return next(error);
  }
};

// Create a new priority (admin only)
const createPriority = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.error(MSG.PRIORITY_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    const { name, level } = req.body;

    // Validate required fields
    if (!name || !level) {
      return res.error(MSG.PRIORITY_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Validate priority level
    const parsedLevel = parseInt(level);
    if (isNaN(parsedLevel) || parsedLevel < 1) {
      return res.error(MSG.INVALID_PRIORITY_LEVEL, STATUS.BAD_REQUEST);
    }

    // Create priority
    const priorityId = await PriorityService.createPriority(
      name.trim(),
      parsedLevel
    );

    const priority = await PriorityService.getPriorityById(priorityId);

    return res.success(priority, MSG.PRIORITY_CREATED, STATUS.CREATED);
  } catch (error) {
    logger.error("Error in createPriority:", error);
    return next(error);
  }
};

// Update a priority (admin only)
const updatePriority = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.error(MSG.PRIORITY_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    const { priority_id } = req.params;
    const { name, level } = req.body;

    // Validate priority_id
    const priorityIdError = validateObjectId(priority_id, "Priority ID");
    if (priorityIdError) {
      return res.error(priorityIdError.message, priorityIdError.status);
    }

    // Validate required fields
    if (!name && !level) {
      return res.error(MSG.PRIORITY_UPDATE_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Get existing priority
    const existingPriority = await PriorityService.getPriorityById(priority_id);
    if (!existingPriority) {
      return res.error(MSG.PRIORITY_NOT_FOUND, STATUS.NOT_FOUND);
    }

    // Prepare updated values
    const updatedName = name ? name.trim() : existingPriority.name;
    const parsedLevel = level ? parseInt(level) : existingPriority.level;

    // Validate level
    if (isNaN(parsedLevel) || parsedLevel < 1) {
      return res.error(MSG.INVALID_PRIORITY_LEVEL, STATUS.BAD_REQUEST);
    }

    // Update priority
    const success = await PriorityService.updatePriority(
      priority_id,
      updatedName,
      parsedLevel
    );

    if (success) {
      const updatedPriority = await PriorityService.getPriorityById(priority_id);
      return res.success(updatedPriority, MSG.PRIORITY_UPDATED, STATUS.OK);
    } else {
      return res.error(
        MSG.PRIORITY_UPDATE_FAILED,
        STATUS.INTERNAL_SERVER_ERROR
      );
    }
  } catch (error) {
    logger.error("Error in updatePriority:", error);
    return next(error);
  }
};

// Delete a priority (admin only)
const deletePriority = async (req, res, next) => {
  try {
    const { priority_id } = req.params;

    // Validate priority_id
    const priorityIdError = validateObjectId(priority_id, "Priority ID");
    if (priorityIdError) {
      return res.error(priorityIdError.message, priorityIdError.status);
    }

    // Check if priority exists
    const priority = await PriorityService.getPriorityById(priority_id);
    if (!priority) {
      return res.error(MSG.PRIORITY_NOT_FOUND, STATUS.NOT_FOUND);
    }

    // Prevent deletion of Low priority (level 1) - find by level instead of hardcoded ID
    if (priority.level === 1) {
      return res.error(MSG.PRIORITY_DELETE_FAILED, STATUS.BAD_REQUEST);
    }

    // Delete priority
    const success = await PriorityService.deletePriority(priority_id);

    if (success) {
      return res.success(null, MSG.PRIORITY_DELETED, STATUS.OK);
    } else {
      return res.error(
        MSG.PRIORITY_DELETE_FAILED,
        STATUS.INTERNAL_SERVER_ERROR
      );
    }
  } catch (error) {
    logger.error("Error in deletePriority:", error);
    return next(error);
  }
};

module.exports = {
  getAllPriorities,
  getPriorityById,
  getPriorityByLevel,
  createPriority,
  updatePriority,
  deletePriority,
};
