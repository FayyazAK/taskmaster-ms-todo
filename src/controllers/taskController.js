const TaskService = require("../services/taskService");
const ListService = require("../services/listService");
const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const {
  validateTitle,
  validateDescription,
  validatePriorityId,
  validateDueDate,
  validateIsCompleted,
  parseIsCompleted,
} = require("../utils/taskValidation");
const { validateObjectId } = require("../utils/validation");
const logger = require('../utils/logger');

const createTask = async (req, res, next) => {
  try {
    // Check if request body exists
    if (req.body === undefined) {
      return res.error(MSG.INVALID_REQUEST, STATUS.BAD_REQUEST);
    }

    const { list_id, title, description, priority_id, due_date } = req.body;

    // Validate list_id
    const listIdError = validateObjectId(list_id, "List ID");
    if (listIdError) {
      return res.error(listIdError.message, listIdError.status);
    }

    // Validate title
    const titleError = validateTitle(title);
    if (titleError) {
      return res.error(titleError.message, titleError.status);
    }

    // Validate description
    const descriptionError = validateDescription(description);
    if (descriptionError) {
      return res.error(descriptionError.message, descriptionError.status);
    }

    // Validate priority (only if provided)
    if (priority_id) {
      const priorityError = await validatePriorityId(priority_id);
      if (priorityError) {
        return res.error(priorityError.message, priorityError.status);
      }
    }

    // Validate due date
    if (due_date !== undefined) {
      const dueDateError = validateDueDate(due_date);
      if (dueDateError) {
        return res.error(dueDateError.message, dueDateError.status);
      }
    }

    // Check if list exists and belongs to user
    const list = await ListService.getListById(list_id, req.user.userId);
    if (!list) {
      return res.error(MSG.LIST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    // Create task with optional fields defaulted if not provided
    const taskId = await TaskService.create(
      list_id,
      title.trim(),
      description ? description.trim() : "",
      priority_id || null,
      due_date || null,
      req.user.userId
    );

    const task = await TaskService.getTaskById(taskId, req.user.userId);

    return res.success(task, MSG.TASK_CREATED, STATUS.CREATED);
  } catch (error) {
    logger.error("Error in createTask:", error);
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    // Validate task_id
    const taskIdError = validateObjectId(task_id, "Task ID");
    if (taskIdError) {
      return res.error(taskIdError.message, taskIdError.status);
    }

    const task = await TaskService.getTaskById(task_id, req.user.userId);
    if (!task) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }
    return res.success(task, MSG.TASK_RETRIEVED, STATUS.OK);
  } catch (error) {
    logger.error("Error in getTaskById:", error);
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { completed } = req.query;
    if (completed !== undefined) {
      const isCompleted = completed === "true";
      const tasks = await TaskService.getAllTasksWithStatus(
        req.user.userId,
        isCompleted
      );
      return res.success(tasks, MSG.TASKS_RETRIEVED, STATUS.OK);
    }
    const tasks = await TaskService.getAllTasks(req.user.userId);
    return res.success(tasks, MSG.TASKS_RETRIEVED, STATUS.OK);
  } catch (error) {
    logger.error("Error in getAllTasks:", error);
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    // Validate task_id
    const taskIdError = validateObjectId(task_id, "Task ID");
    if (taskIdError) {
      return res.error(taskIdError.message, taskIdError.status);
    }

    const deleted = await TaskService.deleteTask(task_id, req.user.userId);

    if (!deleted) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }

    return res.success(null, MSG.TASK_DELETED, STATUS.OK);
  } catch (error) {
    logger.error("Error in deleteTask:", error.message);
    return next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    if (!req.body) {
      return res.error(MSG.IS_COMPLETED_REQUIRED, STATUS.INVALID_REQUEST);
    }

    const { is_completed } = req.body;

    // Validate task_id
    const taskIdError = validateObjectId(task_id, "Task ID");
    if (taskIdError) {
      return res.error(taskIdError.message, taskIdError.status);
    }

    // Validate is_completed
    if (is_completed === undefined)
      return res.error(MSG.IS_COMPLETED_REQUIRED, STATUS.BAD_REQUEST);
    const isCompletedError = validateIsCompleted(is_completed);
    if (isCompletedError) {
      return res.error(isCompletedError.message, isCompletedError.status);
    }

    const isCompletedBoolean = parseIsCompleted(is_completed);

    const updated = await TaskService.updateTaskStatus(
      task_id,
      isCompletedBoolean,
      req.user.userId
    );

    if (!updated) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }

    const task = await TaskService.getTaskById(task_id, req.user.userId);

    return res.success(task, MSG.TASK_STATUS_UPDATED, STATUS.OK);
  } catch (error) {
    logger.error("Error in updateTaskStatus:", error.message);
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    if (!req.body) {
      return res.error(MSG.INVALID_REQUEST, STATUS.BAD_REQUEST);
    }

    const { title, description, priority_id, due_date, list_id } = req.body;

    // Validate task_id
    const taskIdError = validateObjectId(task_id, "Task ID");
    if (taskIdError) {
      return res.error(taskIdError.message, taskIdError.status);
    }

    // Build updateData object for only provided fields
    const updateData = {};

    // Validate and add title if provided
    if (title !== undefined) {
      const titleError = validateTitle(title);
      if (titleError) {
        return res.error(titleError.message, titleError.status);
      }
      updateData.title = title.trim();
    }

    // Validate and add description if provided
    if (description !== undefined) {
      const descriptionError = validateDescription(description);
      if (descriptionError) {
        return res.error(descriptionError.message, descriptionError.status);
      }
      updateData.description = description.trim();
    }

    // Validate and add list_id if provided
    if (list_id !== undefined) {
      const listIdError = validateObjectId(list_id, "List ID");
      if (listIdError) {
        return res.error(listIdError.message, listIdError.status);
      }
      updateData.listId = list_id;
    }

    // Validate and add priority_id if provided
    if (priority_id !== undefined) {
      const priorityError = await validatePriorityId(priority_id);
      if (priorityError) {
        return res.error(priorityError.message, priorityError.status);
      }
      updateData.priorityId = priority_id;
    }

    // Validate and add due_date if provided
    if (due_date !== undefined) {
      const dueDateError = validateDueDate(due_date);
      if (dueDateError) {
        return res.error(dueDateError.message, dueDateError.status);
      }
      updateData.dueDate = due_date;
    }

    const updated = await TaskService.updateTask(
      task_id,
      updateData,
      req.user.userId
    );

    if (!updated) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }

    const task = await TaskService.getTaskById(task_id, req.user.userId);

    return res.success(task, MSG.TASK_UPDATED, STATUS.OK);
  } catch (error) {
    logger.error("Error in updateTask:", error.message);
    return next(error);
  }
};

const getTasksByListId = async (req, res, next) => {
  try {
    const { list_id } = req.params;

    // Validate list_id
    const listIdError = validateObjectId(list_id, "List ID");
    if (listIdError) {
      return res.error(listIdError.message, listIdError.status);
    }

    const tasks = await TaskService.getTasksByListId(list_id, req.user.userId);

    return res.success(tasks, MSG.TASKS_RETRIEVED, STATUS.OK);
  } catch (error) {
    logger.error("Error in getTasksByListId:", error.message);
    return next(error);
  }
};

module.exports = {
  createTask,
  getTaskById,
  getAllTasks,
  deleteTask,
  updateTaskStatus,
  updateTask,
  getTasksByListId,
};
