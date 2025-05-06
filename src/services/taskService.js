const { Task, List } = require("../models");
const { cacheHelpers, keyGenerators } = require("../config/redis");
const logger = require("../utils/logger");

class TaskService {
  static async create(listId, title, description, priorityId, dueDate, userId) {
    try {
      // Verify list belongs to user
      const list = await List.findOne({
        where: { listId, userId },
      });

      if (!list) {
        return false;
      }

      const task = await Task.create({
        listId,
        title,
        description,
        priorityId,
        dueDate,
        isCompleted: false,
      });

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(userId);

      return task.taskId;
    } catch (error) {
      logger.error("Error creating task:", error);
      throw error;
    }
  }

  static async updateTask(taskId, updateData, userId) {
    try {
      const task = await Task.findOne({
        include: [
          {
            model: List,
            where: { userId },
            attributes: ["listId", "title"],
          },
        ],
        where: { taskId },
      });

      if (!task) {
        return false;
      }

      await task.update(updateData);

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(userId);

      return true;
    } catch (error) {
      logger.error("Error updating task:", error);
      throw error;
    }
  }

  static async getTasksByListId(listId, userId) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.listTasks(listId, userId);
      const cachedTasks = await cacheHelpers.get(cacheKey);

      if (cachedTasks) {
        return cachedTasks;
      }

      const tasks = await Task.findAll({
        include: [
          {
            model: List,
            where: { userId },
            attributes: ["listId", "title"],
          },
        ],
        where: { listId },
      });

      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, tasks);

      return tasks;
    } catch (error) {
      logger.error("Error getting tasks by list ID:", error);
      throw error;
    }
  }

  static async getTaskById(taskId, userId) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.task(taskId, userId);
      const cachedTask = await cacheHelpers.get(cacheKey);

      if (cachedTask) {
        return cachedTask;
      }

      const task = await Task.findOne({
        include: [
          {
            model: List,
            where: { userId },
            attributes: ["listId", "title"],
          },
        ],
        where: { taskId },
      });

      if (task) {
        // Store in cache for future requests
        await cacheHelpers.set(cacheKey, task);
      }

      return task;
    } catch (error) {
      logger.error("Error getting task by ID:", error);
      throw error;
    }
  }

  static async getAllTasks(userId) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.userTasks(userId);
      const cachedTasks = await cacheHelpers.get(cacheKey);

      if (cachedTasks) {
        return cachedTasks;
      }

      const tasks = await Task.findAll({
        include: [
          {
            model: List,
            where: { userId },
            attributes: ["listId", "title"],
          },
        ],
      });

      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, tasks);

      return tasks;
    } catch (error) {
      logger.error("Error getting all tasks:", error);
      throw error;
    }
  }

  static async getAllTasksWithStatus(userId, isCompleted) {
    try {
      // Try to get from cache first
      const cacheKey = `${keyGenerators.userTasks(
        userId
      )}:status:${isCompleted}`;
      const cachedTasks = await cacheHelpers.get(cacheKey);

      if (cachedTasks) {
        return cachedTasks;
      }

      const tasks = await Task.findAll({
        include: [
          {
            model: List,
            where: { userId },
            attributes: ["listId", "title"],
          },
        ],
        where: { isCompleted },
      });

      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, tasks);

      return tasks;
    } catch (error) {
      logger.error("Error getting tasks with status:", error);
      throw error;
    }
  }

  static async deleteTask(taskId, userId) {
    try {
      const task = await Task.findOne({
        include: [
          {
            model: List,
            where: { userId },
            attributes: ["listId", "title"],
          },
        ],
        where: { taskId },
      });

      if (!task) {
        return false;
      }

      await task.destroy();

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(userId);

      return true;
    } catch (error) {
      logger.error("Error deleting task:", error);
      throw error;
    }
  }

  static async updateTaskStatus(taskId, isCompleted, userId) {
    try {
      const task = await Task.findOne({
        include: [
          {
            model: List,
            where: { userId },
            attributes: ["listId", "title"],
          },
        ],
        where: { taskId },
      });

      if (!task) {
        return false;
      }

      await task.update({ isCompleted });

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(userId);

      return true;
    } catch (error) {
      logger.error("Error updating task status:", error);
      throw error;
    }
  }
}

module.exports = TaskService;
