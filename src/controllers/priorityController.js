const PriorityService = require("../services/priorityService");
const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");

// Get all priority levels
const getAllPriorities = async (req, res, next) => {
  try {
    const priorities = await PriorityService.getPriorities();
    return res.success(priorities, MSG.PRIORITIES_RETRIEVED, STATUS.OK);
  } catch (error) {
    console.error("Error in getAllPriorities:", error);
    return next(error);
  }
};

// Get priority by ID
const getPriorityById = async (req, res, next) => {
  try {
    const { priority_id } = req.params;

    // Validate priority_id
    const parsedPriorityId = parseInt(priority_id);
    if (isNaN(parsedPriorityId)) {
      return res.error(MSG.INVALID_PRIORITY_ID, STATUS.BAD_REQUEST);
    }

    // Get priority
    const priority = await PriorityService.getPriorityById(parsedPriorityId);

    if (!priority) {
      return res.error(MSG.PRIORITY_NOT_FOUND, STATUS.NOT_FOUND);
    }

    return res.success(priority, MSG.PRIORITY_RETRIEVED, STATUS.OK);
  } catch (error) {
    console.error("Error in getPriorityById:", error);
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
    console.error("Error in getPriorityByLevel:", error);
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
    console.error("Error in createPriority:", error);
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
    const parsedPriorityId = parseInt(priority_id);
    if (isNaN(parsedPriorityId)) {
      return res.error(MSG.INVALID_PRIORITY_ID, STATUS.BAD_REQUEST);
    }

    // Validate required fields
    if (!name && !level) {
      return res.error(MSG.PRIORITY_UPDATE_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Get existing priority
    const existingPriority = await PriorityService.getPriorityById(
      parsedPriorityId
    );
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
      parsedPriorityId,
      updatedName,
      parsedLevel
    );

    if (success) {
      const updatedPriority = await PriorityService.getPriorityById(
        parsedPriorityId
      );
      return res.success(updatedPriority, MSG.PRIORITY_UPDATED, STATUS.OK);
    } else {
      return res.error(
        MSG.PRIORITY_UPDATE_FAILED,
        STATUS.INTERNAL_SERVER_ERROR
      );
    }
  } catch (error) {
    console.error("Error in updatePriority:", error);
    return next(error);
  }
};

// Delete a priority (admin only)
const deletePriority = async (req, res, next) => {
  try {
    const { priority_id } = req.params;

    // Validate priority_id
    const parsedPriorityId = parseInt(priority_id);
    if (isNaN(parsedPriorityId)) {
      return res.error(MSG.INVALID_PRIORITY_ID, STATUS.BAD_REQUEST);
    }

    if (parsedPriorityId === 1) {
      return res.error(MSG.PRIORITY_DELETE_FAILED, STATUS.BAD_REQUEST);
    }

    // Check if priority exists
    const priority = await PriorityService.getPriorityById(parsedPriorityId);
    if (!priority) {
      return res.error(MSG.PRIORITY_NOT_FOUND, STATUS.NOT_FOUND);
    }

    // Delete priority
    const success = await PriorityService.deletePriority(parsedPriorityId);

    if (success) {
      return res.success(null, MSG.PRIORITY_DELETED, STATUS.OK);
    } else {
      return res.error(
        MSG.PRIORITY_DELETE_FAILED,
        STATUS.INTERNAL_SERVER_ERROR
      );
    }
  } catch (error) {
    console.error("Error in deletePriority:", error);
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
