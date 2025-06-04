const { Task, List, Priority } = require("../models");
const { cacheHelpers, keyGenerators } = require("../config/redis");
const logger = require("../utils/logger");

class TaskService {
  static async create(listId, title, description, priorityId, dueDate, userId) {
    try {
      // Verify list belongs to user
      const list = await List.findOne({
        _id: listId,
        userId: userId,
      });

      if (!list) {
        return false;
      }

      // If no priorityId provided, get the default "Low" priority (level 1)
      let finalPriorityId = priorityId;
      if (!priorityId) {
        const defaultPriority = await Priority.findOne({ level: 1 });
        if (defaultPriority) {
          finalPriorityId = defaultPriority._id;
        }
      }

      const task = await Task.create({
        listId,
        title,
        description,
        priorityId: finalPriorityId,
        dueDate,
        isCompleted: false,
      });

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(userId);

      return task._id;
    } catch (error) {
      logger.error("Error creating task:", error);
      throw error;
    }
  }

  static async updateTask(taskId, updateData, userId) {
    try {
      const task = await Task.findById(taskId).populate({
        path: 'listId',
        match: { userId: userId },
        select: 'title'
      });

      if (!task || !task.listId) {
        return false;
      }

      await Task.findByIdAndUpdate(taskId, updateData);

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

      // First verify the list belongs to the user
      const list = await List.findOne({ _id: listId, userId: userId });
      if (!list) {
        return [];
      }

      const tasks = await Task.find({ listId })
        .populate({
          path: 'listId',
          select: 'title'
        })
        .populate({
          path: 'priorityId',
          select: 'name level'
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

      const task = await Task.findById(taskId)
        .populate({
          path: 'listId',
          match: { userId: userId },
          select: 'title'
        })
        .populate({
          path: 'priorityId',
          select: 'name level'
        });

      if (!task || !task.listId) {
        return null;
      }

      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, task);

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

      // Get all lists for the user first
      const userLists = await List.find({ userId }).select('_id');
      const listIds = userLists.map(list => list._id);

      const tasks = await Task.find({ listId: { $in: listIds } })
        .populate({
          path: 'listId',
          select: 'title'
        })
        .populate({
          path: 'priorityId',
          select: 'name level'
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

      // Get all lists for the user first
      const userLists = await List.find({ userId }).select('_id');
      const listIds = userLists.map(list => list._id);

      const tasks = await Task.find({
        listId: { $in: listIds },
        isCompleted: isCompleted
      })
        .populate({
          path: 'listId',
          select: 'title'
        })
        .populate({
          path: 'priorityId',
          select: 'name level'
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
      const task = await Task.findById(taskId).populate({
        path: 'listId',
        match: { userId: userId },
        select: 'title'
      });

      if (!task || !task.listId) {
        return false;
      }

      await Task.findByIdAndDelete(taskId);

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
      const task = await Task.findById(taskId).populate({
        path: 'listId',
        match: { userId: userId },
        select: 'title'
      });

      if (!task || !task.listId) {
        return false;
      }

      await Task.findByIdAndUpdate(taskId, { isCompleted });

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
