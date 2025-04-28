const Task = require("../models/Task");
const List = require("../models/List");
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

const createTask = async (req, res, next) => {
  try {
    // Check if request body exists
    if (req.body === undefined) {
      return res.error(MSG.INVALID_REQUEST, STATUS.BAD_REQUEST);
    }

    const { list_id, title, description, priority_id, due_date } = req.body;

    // Validate required fields
    if (!list_id) {
      return res.error(MSG.LIST_ID_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Parse list_id to ensure it's a number
    const parsedListId = parseInt(list_id);
    if (isNaN(parsedListId)) {
      return res.error(MSG.INVALID_LIST_ID, STATUS.BAD_REQUEST);
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

    // Validate priority
    const priorityError = await validatePriorityId(priority_id);
    if (priorityError) {
      return res.error(priorityError.message, priorityError.status);
    }

    // Validate due date
    if (due_date !== undefined) {
      const dueDateError = validateDueDate(due_date);
      if (dueDateError) {
        return res.error(dueDateError.message, dueDateError.status);
      }
    }

    // Check if list exists and belongs to user
    const list = await List.getListById(parsedListId, req.user.user_id);
    if (!list) {
      return res.error(MSG.LIST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    // Create task with optional fields defaulted if not provided
    const insertId = await Task.create(
      parsedListId,
      title.trim(),
      description ? description.trim() : "",
      priority_id ? parseInt(priority_id) : 1,
      due_date || null,
      req.user.user_id
    );

    const task = await Task.getTaskById(insertId, req.user.user_id);

    return res.success(task, MSG.TASK_CREATED, STATUS.CREATED);
  } catch (error) {
    console.error("Error in createTask:", error);
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    // Validate IDs
    const parsedTaskId = parseInt(task_id);

    if (isNaN(parsedTaskId)) {
      return res.error(MSG.INVALID_TASK_ID, STATUS.BAD_REQUEST);
    }

    const task = await Task.getTaskById(parsedTaskId, req.user.user_id);
    if (!task) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }
    return res.success(task, MSG.TASK_RETRIEVED, STATUS.OK);
  } catch (error) {
    console.error("Error in getTaskById:", error);
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { completed } = req.query;
    if (completed !== undefined) {
      const isCompleted = completed === "true";
      const tasks = await Task.getAllTasksWithStatus(
        req.user.user_id,
        isCompleted
      );
      return res.success(tasks, MSG.TASKS_RETRIEVED, STATUS.OK);
    }
    const tasks = await Task.getAllTasks(req.user.user_id);
    return res.success(tasks, MSG.TASKS_RETRIEVED, STATUS.OK);
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    // Validate IDs
    const parsedTaskId = parseInt(task_id);

    if (isNaN(parsedTaskId)) {
      return res.error(MSG.INVALID_TASK_ID, STATUS.BAD_REQUEST);
    }

    const deleted = await Task.deleteTask(parsedTaskId, req.user.user_id);

    if (!deleted) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }

    return res.success(null, MSG.TASK_DELETED, STATUS.OK);
  } catch (error) {
    console.error("Error in deleteTask:", error.message);
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

    // Validate parameters
    const parsedTaskId = parseInt(task_id);

    if (isNaN(parsedTaskId)) {
      return res.error(MSG.INVALID_TASK_ID, STATUS.BAD_REQUEST);
    }

    // Validate is_completed
    if (is_completed === undefined)
      return res.error(MSG.IS_COMPLETED_REQUIRED, STATUS.BAD_REQUEST);
    const isCompletedError = validateIsCompleted(is_completed);
    if (isCompletedError) {
      return res.error(isCompletedError.message, isCompletedError.status);
    }

    const isCompletedBoolean = parseIsCompleted(is_completed);

    const updated = await Task.updateTaskStatus(
      parsedTaskId,
      isCompletedBoolean,
      req.user.user_id
    );

    if (!updated) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }

    const task = await Task.getTaskById(parsedTaskId, req.user.user_id);

    return res.success(task, MSG.TASK_STATUS_UPDATED, STATUS.OK);
  } catch (error) {
    console.error("Error in updateTaskStatus:", error.message);
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    if (!req.body) {
      return res.error(MSG.TASK_UPDATE_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    const { list_id, title, description, priority_id, due_date, is_completed } =
      req.body;

    // Validate IDs
    const parsedTaskId = parseInt(task_id);

    if (isNaN(parsedTaskId)) {
      return res.error(MSG.INVALID_TASK_ID, STATUS.BAD_REQUEST);
    }

    // Check if at least one field to update is provided
    if (Object.keys(req.body).length === 0) {
      return res.error(MSG.TASK_UPDATE_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Validate fields if provided
    let parsedListId;
    if (list_id !== undefined) {
      parsedListId = parseInt(list_id);
      if (isNaN(parsedListId)) {
        return res.error(MSG.INVALID_LIST_ID, STATUS.BAD_REQUEST);
      }
    }
    if (title !== undefined) {
      const titleError = validateTitle(title);
      if (titleError) {
        return res.error(titleError.message, titleError.status);
      }
    }

    if (description !== undefined) {
      const descriptionError = validateDescription(description);
      if (descriptionError) {
        return res.error(descriptionError.message, descriptionError.status);
      }
    }

    if (priority_id !== undefined) {
      const priorityError = await validatePriorityId(priority_id);
      if (priorityError) {
        return res.error(priorityError.message, priorityError.status);
      }
    }

    if (due_date !== undefined) {
      const dueDateError = validateDueDate(due_date);
      if (dueDateError) {
        return res.error(dueDateError.message, dueDateError.status);
      }
    }

    if (is_completed !== undefined) {
      const isCompletedError = validateIsCompleted(is_completed);
      if (isCompletedError) {
        return res.error(isCompletedError.message, isCompletedError.status);
      }
    }
    // Get existing task
    const existingTask = await Task.getTaskById(parsedTaskId, req.user.user_id);
    if (!existingTask) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }

    // Prepare update data - only include fields that were provided in the request
    const updateData = {};

    if (list_id !== undefined) updateData.list_id = parsedListId;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description.trim() || "";
    if (priority_id !== undefined)
      updateData.priority_id = parseInt(priority_id);
    if (due_date !== undefined) updateData.due_date = due_date;
    if (is_completed !== undefined) {
      updateData.is_completed = parseIsCompleted(is_completed);
    }

    // Update the task
    const updated = await Task.updateTask(
      parsedTaskId,
      updateData,
      req.user.user_id
    );

    if (!updated) {
      return res.error(MSG.TASK_UPDATE_FAILED, STATUS.INTERNAL_SERVER_ERROR);
    }

    const updatedTask = await Task.getTaskById(parsedTaskId, req.user.user_id);

    if (!updatedTask) {
      return res.error(MSG.TASK_NOT_FOUND, STATUS.NOT_FOUND);
    }
    const listId = parsedListId || existingTask.list_id;
    const isUpdated = await List.updateListTimestamp(listId, req.user.user_id);
    if (!isUpdated) {
      return res.error(
        MSG.UPDATE_LIST_TIMESTAMP_FAILED,
        STATUS.INTERNAL_SERVER_ERROR
      );
    }
    const task = await Task.getTaskById(parsedTaskId, req.user.user_id);

    return res.success(task, MSG.TASK_UPDATED, STATUS.OK);
  } catch (error) {
    console.error("Error in updateTask:", error.message);
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
};
