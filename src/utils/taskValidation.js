const STATUS = require("./statusCodes");
const PriorityService = require("../services/priorityService");
const config = require("../config/env");
const MSG = require("./messages");
const mongoose = require("mongoose");

const validateTitle = (title) => {
  if (!title || title.trim() === "") {
    return {
      message: MSG.TASK_TITLE_REQUIRED,
      status: STATUS.BAD_REQUEST,
    };
  }

  if (title.length > config.task.titleMaxLength) {
    return {
      message: MSG.TASK_TITLE_LENGTH,
      status: STATUS.BAD_REQUEST,
    };
  }

  return null;
};

const validateDescription = (description) => {
  if (description && description.length > config.task.descriptionMaxLength) {
    return {
      message: MSG.TASK_DESCRIPTION_LENGTH,
      status: STATUS.BAD_REQUEST,
    };
  }
  return null;
};

const validatePriorityId = async (priorityId) => {
  if (priorityId === undefined || priorityId === null) {
    return null;
  }

  // Check if it's a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(priorityId)) {
    return {
      message: MSG.TASK_PRIORITY_ID_INVALID,
      status: STATUS.BAD_REQUEST,
    };
  }

  const priority = await PriorityService.getPriorityById(priorityId);
  if (!priority) {
    return {
      message: MSG.TASK_PRIORITY_ID_INVALID,
      status: STATUS.BAD_REQUEST,
    };
  }

  return null;
};

const validateDueDate = (dueDate) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dueDate)) {
    return {
      message: MSG.TASK_DUE_DATE_INVALID,
      status: STATUS.BAD_REQUEST,
    };
  }

  return null;
};

const validateIsCompleted = (isCompleted) => {
  if (isCompleted === undefined) {
    return null;
  }

  if (
    typeof isCompleted !== "boolean" &&
    isCompleted !== "0" &&
    isCompleted !== "1" &&
    isCompleted !== 0 &&
    isCompleted !== 1 &&
    isCompleted !== "true" &&
    isCompleted !== "false"
  ) {
    return {
      message: MSG.IS_COMPLETED_INVALID,
      status: STATUS.BAD_REQUEST,
    };
  }

  return null;
};

const parseIsCompleted = (isCompleted) => {
  return (
    isCompleted === true ||
    isCompleted === "true" ||
    isCompleted === 1 ||
    isCompleted === "1"
  );
};

module.exports = {
  validateTitle,
  validateDescription,
  validatePriorityId,
  validateDueDate,
  validateIsCompleted,
  parseIsCompleted,
};
