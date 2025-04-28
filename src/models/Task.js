const db = require("../config/database");
const TASK = require("../queries/taskQueries");
const { cacheHelpers, keyGenerators } = require("../config/redis");
class Task {
  static async createTable() {
    try {
      await db.execute(TASK.CREATE_TABLE);
    } catch (error) {
      console.error("Error creating tasks table:", error);
      throw error;
    }
  }

  static async create(
    list_id,
    title,
    description,
    priority_id,
    due_date,
    user_id
  ) {
    try {
      const [result] = await db.execute(TASK.CREATE_TASK, [
        list_id,
        title,
        description,
        priority_id,
        due_date,
      ]);

      // Update the list's timestamp
      if (result.insertId) {
        await db.execute(TASK.UPDATE_LIST_TIMESTAMP, [list_id, user_id]);
      }

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(user_id);

      return result.insertId;
    } catch (error) {
      console.error("Error creating task: ", error);
      throw error;
    }
  }

  static async updateTask(task_id, updateData, user_id) {
    try {
      const setFields = [];
      const values = [];

      // Add fields that were provided in updateData
      if (updateData.list_id !== undefined) {
        setFields.push("list_id = ?");
        values.push(updateData.list_id);
      }

      if (updateData.title !== undefined) {
        setFields.push("title = ?");
        values.push(updateData.title);
      }

      if (updateData.description !== undefined) {
        setFields.push("description = ?");
        values.push(updateData.description);
      }

      if (updateData.priority_id !== undefined) {
        setFields.push("priority_id = ?");
        values.push(updateData.priority_id);
      }

      if (updateData.due_date !== undefined) {
        setFields.push("due_date = ?");
        values.push(updateData.due_date);
      }

      if (updateData.is_completed !== undefined) {
        setFields.push("is_completed = ?");
        values.push(updateData.is_completed ? 1 : 0);
      }

      // If no fields to update, return success
      if (setFields.length === 0) {
        return true;
      }

      // Build the query
      const query = `
      UPDATE tasks t
      JOIN lists l ON t.list_id = l.list_id
      SET ${setFields.map((field) => `t.${field}`).join(", ")}
      WHERE t.task_id = ? AND l.user_id = ?
    `;

      // WHERE clause parameters
      values.push(task_id, user_id);

      // Execute the query
      const [result] = await db.execute(query, values);

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(user_id);

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  static async getTasksByListId(list_id, user_id) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.listTasks(list_id, user_id);
      const cachedTasks = await cacheHelpers.get(cacheKey);

      if (cachedTasks) {
        return cachedTasks;
      }
      const [results] = await db.execute(TASK.GET_TASKS_BY_LIST_ID, [
        list_id,
        user_id,
      ]);
      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error("Error getting tasks by list ID: ", error);
      throw error;
    }
  }

  static async getTaskById(task_id, user_id) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.task(task_id, user_id);
      const cachedTask = await cacheHelpers.get(cacheKey);

      if (cachedTask) {
        return cachedTask;
      }

      const [results] = await db.execute(TASK.GET_TASK_BY_ID, [
        task_id,
        user_id,
      ]);

      if (results.length > 0) {
        // Store in cache for future requests
        await cacheHelpers.set(cacheKey, results[0]);
        return results[0];
      }
      return null;
    } catch (error) {
      console.error("Error getting task by ID: ", error);
      throw error;
    }
  }

  static async getAllTasks(user_id) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.userTasks(user_id);
      const cachedTasks = await cacheHelpers.get(cacheKey);

      if (cachedTasks) {
        return cachedTasks;
      }
      const [results] = await db.execute(TASK.GET_ALL_TASKS, [user_id]);
      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error("Error getting all tasks: ", error);
      throw error;
    }
  }

  static async getAllTasksWithStatus(user_id, is_completed) {
    try {
      // Try to get from cache first
      const cacheKey = `${keyGenerators.userTasks(
        user_id
      )}:status:${is_completed}`;
      const cachedTasks = await cacheHelpers.get(cacheKey);

      if (cachedTasks) {
        return cachedTasks;
      }

      const [results] = await db.execute(TASK.GET_ALL_TASKS_WITH_STATUS, [
        user_id,
        is_completed,
      ]);

      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error("Error getting all tasks: ", error);
      throw error;
    }
  }

  static async deleteTask(task_id, user_id) {
    try {
      const [result] = await db.execute(TASK.DELETE_TASK, [task_id, user_id]);

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(user_id);

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting task: ", error);
      throw error;
    }
  }

  static async updateTaskStatus(task_id, is_completed, user_id) {
    try {
      const [result] = await db.execute(TASK.UPDATE_TASK_STATUS, [
        is_completed ? 1 : 0, // Convert boolean to 1/0
        task_id,
        user_id,
      ]);

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(user_id);

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating task status: ", error);
      throw error;
    }
  }
}

module.exports = Task;
