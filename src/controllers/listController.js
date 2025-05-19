const config = require("../config/env");
const ListService = require("../services/listService");
const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const logger = require('../utils/logger');

const createList = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.error(MSG.INVALID_REQUEST, STATUS.BAD_REQUEST);
    }

    const { title, description } = req.body;

    // Validate inputs
    if (!title || typeof title !== "string") {
      return res.error(MSG.LIST_TITLE_REQUIRED, STATUS.BAD_REQUEST);
    }

    const trimmedTitle = title.trim();

    if (
      trimmedTitle.length < config.LIST_TITLE_MIN_LENGTH ||
      trimmedTitle.length > config.LIST_TITLE_MAX_LENGTH
    ) {
      return res.error(MSG.LIST_TITLE_LENGTH, STATUS.BAD_REQUEST);
    }

    const listId = await ListService.create(
      req.user.userId,
      trimmedTitle,
      description ? description.trim() : ""
    );

    const list = await ListService.getListById(listId, req.user.userId);
    res.success(list, MSG.LIST_CREATED, STATUS.CREATED);
  } catch (error) {
    logger.error("Error in createList:", error.message);
    return next(error);
  }
};

const getUserLists = async (req, res, next) => {
  try {
    const { include_tasks } = req.query;
    const lists =
      include_tasks === "true"
        ? await ListService.getListsWithTasks(req.user.userId)
        : await ListService.getLists(req.user.userId);
    res.success(lists, MSG.LISTS_RETRIEVED, STATUS.OK);
  } catch (error) {
    logger.error("Error in getUserLists:", error.message);
    return next(error);
  }
};

const getListById = async (req, res, next) => {
  try {
    const { list_id } = req.params;
    const { include_tasks } = req.query;

    if (!list_id || isNaN(parseInt(list_id))) {
      return res.error(MSG.INVALID_LIST_ID, STATUS.BAD_REQUEST);
    }

    const list =
      include_tasks === "true"
        ? await ListService.getListByIdWithTasks(
            parseInt(list_id),
            req.user.userId
          )
        : await ListService.getListById(parseInt(list_id), req.user.userId);

    if (!list) {
      return res.error(MSG.LIST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    return res.success(list, MSG.LIST_RETRIEVED, STATUS.OK);
  } catch (error) {
    logger.error("Error in getListById:", error.message);
    return next(error);
  }
};

const updateList = async (req, res, next) => {
  try {
    const { list_id } = req.params;
    const { title, description } = req.body;

    if (!list_id || isNaN(parseInt(list_id))) {
      return res.error(MSG.INVALID_LIST_ID, STATUS.BAD_REQUEST);
    }

    if (!title && !description) {
      return res.error(MSG.LIST_UPDATE_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Prepare update data
    const updateData = {};

    if (title) {
      const trimmedTitle = title.trim();
      if (
        typeof title !== "string" ||
        trimmedTitle.length < config.LIST_TITLE_MIN_LENGTH ||
        trimmedTitle.length > config.LIST_TITLE_MAX_LENGTH
      ) {
        return res.error(MSG.LIST_TITLE_LENGTH, STATUS.BAD_REQUEST);
      }
      updateData.title = trimmedTitle;
    }

    if (description) {
      const trimmedDescription = description.trim();
      if (
        typeof description !== "string" ||
        trimmedDescription.length > config.LIST_DESCRIPTION_MAX_LENGTH
      ) {
        return res.error(MSG.LIST_DESCRIPTION_LENGTH, STATUS.BAD_REQUEST);
      }
      updateData.description = trimmedDescription;
    }

    // Update the list
    const updatedList = await ListService.updateList(
      parseInt(list_id),
      req.user.userId,
      updateData
    );

    if (!updatedList) {
      return res.error(MSG.LIST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    return res.success(updatedList, MSG.LIST_UPDATED, STATUS.OK);
  } catch (error) {
    logger.error("Error in updateList:", error.message);
    return next(error);
  }
};

const deleteList = async (req, res, next) => {
  try {
    const { list_id } = req.params;

    if (!list_id || isNaN(parseInt(list_id))) {
      return res.error(MSG.INVALID_LIST_ID, STATUS.BAD_REQUEST);
    }

    const deleted = await ListService.deleteList(
      parseInt(list_id),
      req.user.userId
    );

    if (!deleted) {
      return res.error(MSG.LIST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    return res.success(null, MSG.LIST_DELETED, STATUS.OK);
  } catch (error) {
    logger.error("Error in deleteList:", error.message);
    return next(error);
  }
};

const deleteAllLists = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.error(MSG.UNAUTHORIZED, STATUS.UNAUTHORIZED);
    }
    await ListService.deleteAllLists(req.user.userId);
    return res.success(null, MSG.LISTS_DELETED, STATUS.OK);
  } catch (error) {
    logger.error("Error in deleteAllLists:", error.message);
    return next(error);
  }
};

const cleanUpList = async (req, res, next) => {
  try {
    const { list_id } = req.params;

    if (!list_id || isNaN(parseInt(list_id))) {
      return res.error(MSG.INVALID_LIST_ID, STATUS.BAD_REQUEST);
    }
    //Check if the list exists
    const list = await ListService.getListById(
      parseInt(list_id),
      req.user.userId
    );

    //Check if the list belongs to the user
    if (!list) {
      return res.error(MSG.LIST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    await ListService.cleanUpList(parseInt(list_id));

    return res.success(null, MSG.LIST_CLEANED_UP, STATUS.OK);
  } catch (error) {
    logger.error("Error in cleanUpList:", error.message);
    return next(error);
  }
};

const cleanUpAllLists = async (req, res, next) => {
  try {
    await ListService.cleanUpAllLists(req.user.userId);
    return res.success(null, MSG.LISTS_CLEANED_UP, STATUS.OK);
  } catch (error) {
    logger.error("Error in cleanUpAllLists:", error.message);
    return next(error);
  }
};

module.exports = {
  createList,
  getUserLists,
  getListById,
  updateList,
  deleteList,
  deleteAllLists,
  cleanUpList,
  cleanUpAllLists,
};
