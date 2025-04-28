const db = require("../config/database");
const LIST = require("../queries/listQueries");
const Task = require("./Task");
const { cacheHelpers, keyGenerators } = require("../config/redis");
class List {
  static async createTable() {
    try {
      await db.execute(LIST.CREATE_TABLE);
    } catch (error) {
      console.error("Error creating lists table:", error);
      throw new Error(`Failed to create lists table: ${error.message}`);
    }
  }

  //Create a new list
  static async create(user_id, title, description) {
    try {
      const [result] = await db.execute(LIST.CREATE_LIST, [
        user_id,
        title,
        description,
      ]);

      // Invalidate user's list cache
      await cacheHelpers.del(keyGenerators.userLists(user_id));

      return result.insertId;
    } catch (error) {
      console.error("Error creating list:", error);
      throw new Error(`Failed to create list: ${error.message}`);
    }
  }

  //Get all lists for a user
  static async getLists(user_id) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.userLists(user_id);
      const cachedLists = await cacheHelpers.get(cacheKey);

      if (cachedLists) {
        return cachedLists;
      }
      const [results] = await db.execute(LIST.GET_LISTS_BY_USER_ID, [user_id]);
      if (!results || results.length === 0) {
        return [];
      }
      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error("Error getting lists by user ID:", error);
      throw new Error(`Failed to get lists: ${error.message}`);
    }
  }

  //Get all lists for a user with tasks
  static async getListsWithTasks(user_id) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.userListsWithTasks(user_id);
      const cachedLists = await cacheHelpers.get(cacheKey);

      if (cachedLists) {
        return cachedLists;
      }

      const [results] = await db.execute(LIST.GET_LISTS_BY_USER_ID, [user_id]);
      if (!results || results.length === 0) {
        return [];
      }
      const lists = await Promise.all(
        results.map(async (list) => {
          const tasks = await Task.getTasksByListId(list.list_id, user_id);
          return { ...list, tasks };
        })
      );
      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, lists);
      return lists;
    } catch (error) {
      console.error("Error getting lists by user ID:", error);
      throw new Error(`Failed to get lists: ${error.message}`);
    }
  }

  //Get a list by ID and user_id
  static async getListById(list_id, user_id) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.list(list_id, user_id);
      const cachedList = await cacheHelpers.get(cacheKey);

      if (cachedList) {
        return cachedList;
      }
      const [results] = await db.execute(LIST.GET_LIST_BY_ID, [
        list_id,
        user_id,
      ]);
      if (!results || results.length === 0) {
        return null;
      }
      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, results[0]);
      return results[0];
    } catch (error) {
      console.error("Error getting list by ID:", error);
      throw new Error(`Failed to get list: ${error.message}`);
    }
  }

  //Get a list by ID and user_id with tasks
  static async getListByIdWithTasks(list_id, user_id) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.listWithTasks(list_id, user_id);
      const cachedList = await cacheHelpers.get(cacheKey);

      if (cachedList) {
        return cachedList;
      }
      const [results] = await db.execute(LIST.GET_LIST_BY_ID, [
        list_id,
        user_id,
      ]);

      // If no results, return null
      if (!results || results.length === 0) {
        return null;
      }
      const listData = results[0];
      const tasks = await Task.getTasksByListId(listData.list_id, user_id);
      // Add tasks to the list
      listData.tasks = tasks;
      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, listData);
      return listData;
    } catch (error) {
      console.error("Error getting list by ID:", error);
      throw new Error(`Failed to get list: ${error.message}`);
    }
  }

  //Update a list by dynamic query binding
  static async updateList(list_id, user_id, updateData) {
    try {
      // Ensure we have valid fields to update
      const validFields = ["title", "description"];
      const fieldsToUpdate = Object.keys(updateData).filter(
        (key) => validFields.includes(key) && updateData[key] !== undefined
      );

      if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields to update");
      }

      // Build the SET part of the query dynamically
      const setClause = fieldsToUpdate
        .map((field) => `${field} = ?`)
        .join(", ");
      const values = fieldsToUpdate.map((field) => updateData[field]);

      // Add list_id and user_id to values array for the WHERE clause
      values.push(list_id, user_id);

      // Build and execute the query
      const query = `
        UPDATE lists 
        SET ${setClause} 
        WHERE list_id = ? AND user_id = ?
      `;

      const [result] = await db.execute(query, values);

      if (result.affectedRows === 0) {
        // List doesn't exist or doesn't belong to the user
        return null;
      }
      // Invalidate all affected caches
      await Promise.all([
        cacheHelpers.del(keyGenerators.list(list_id, user_id)),
        cacheHelpers.del(keyGenerators.listWithTasks(list_id, user_id)),
        cacheHelpers.del(keyGenerators.userLists(user_id)),
        cacheHelpers.del(keyGenerators.userListsWithTasks(user_id)),
      ]);
      // Fetch and return the updated list
      return await this.getListById(list_id, user_id);
    } catch (error) {
      console.error("Error updating list:", error);
      throw new Error(`Failed to update list: ${error.message}`);
    }
  }

  //Delete a list
  static async deleteList(list_id, user_id) {
    try {
      const [result] = await db.execute(LIST.DELETE_LIST, [list_id, user_id]);
      // Invalidate all affected caches
      await cacheHelpers.deleteUserCache(user_id);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting list:", error);
      throw new Error(`Failed to delete list: ${error.message}`);
    }
  }

  //Delete all lists for a user
  static async deleteAllLists(user_id) {
    try {
      const [result] = await db.execute(LIST.DELETE_ALL_LISTS, [user_id]);

      // Invalidate all user's list and task caches
      await cacheHelpers.deleteUserCache(user_id);

      return result.affectedRows;
    } catch (error) {
      console.error("Error deleting all lists:", error);
      throw new Error(`Failed to delete all lists: ${error.message}`);
    }
  }

  //Clean up the list by deleting all tasks associated with it
  static async cleanUpList(list_id) {
    try {
      const [result] = await db.execute(LIST.CLEAN_UP_LIST, [list_id]);
      // Invalidate all caches for this user
      await cacheHelpers.deleteUserCache(user_id);
      return result.affectedRows;
    } catch (error) {
      console.error("Error cleaning up list:", error);
      throw new Error(`Failed to clean up list: ${error.message}`);
    }
  }

  //Clean up all lists by deleting all tasks associated with them
  static async cleanUpAllLists(user_id) {
    try {
      const [result] = await db.execute(LIST.CLEAN_UP_ALL_LISTS, [user_id]);
      // Invalidate all caches for this user
      await cacheHelpers.deleteUserCache(user_id);
      return result.affectedRows;
    } catch (error) {
      console.error("Error cleaning up all lists:", error);
      throw new Error(`Failed to clean up all lists: ${error.message}`);
    }
  }

  static async updateListTimestamp(list_id, user_id) {
    try {
      const [result] = await db.execute(LIST.UPDATE_LIST_TIMESTAMP, [
        list_id,
        user_id,
      ]);
      // Invalidate all affected caches
      await Promise.all([
        cacheHelpers.del(keyGenerators.list(list_id, user_id)),
        cacheHelpers.del(keyGenerators.listWithTasks(list_id, user_id)),
        cacheHelpers.del(keyGenerators.userLists(user_id)),
        cacheHelpers.del(keyGenerators.userListsWithTasks(user_id)),
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating list timestamp: ", error);
      throw error;
    }
  }
}

module.exports = List;
