const { List, Task } = require("../models");
const { cacheHelpers, keyGenerators } = require("../config/redis");
const logger = require("../utils/logger");

class ListService {
  static async create(userId, title, description) {
    try {
      const list = await List.create({
        userId,
        title,
        description,
      });

      // Invalidate user's list cache
      await cacheHelpers.del(keyGenerators.userLists(userId));
      await cacheHelpers.del(keyGenerators.userListsWithTasks(userId));
      return list._id;
    } catch (error) {
      logger.error("Error creating list:", error);
      throw error;
    }
  }

  static async getLists(userId) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.userLists(userId);
      const cachedLists = await cacheHelpers.get(cacheKey);

      if (cachedLists) {
        return cachedLists;
      }

      const lists = await List.find({ userId });

      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, lists);

      return lists;
    } catch (error) {
      logger.error("Error getting lists:", error);
      throw error;
    }
  }

  static async getListsWithTasks(userId) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.userListsWithTasks(userId);
      const cachedLists = await cacheHelpers.get(cacheKey);

      if (cachedLists) {
        return cachedLists;
      }

      const lists = await List.find({ userId });
      
      // Manually populate tasks for each list
      const listsWithTasks = await Promise.all(
        lists.map(async (list) => {
          const tasks = await Task.find({ listId: list._id })
            .populate({
              path: 'priorityId',
              select: 'name level'
            });
          return {
            ...list.toObject(),
            Tasks: tasks
          };
        })
      );

      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, listsWithTasks);

      return listsWithTasks;
    } catch (error) {
      logger.error("Error getting lists with tasks:", error);
      throw error;
    }
  }

  static async getListById(listId, userId) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.list(listId, userId);
      const cachedList = await cacheHelpers.get(cacheKey);

      if (cachedList) {
        return cachedList;
      }

      const list = await List.findOne({ _id: listId, userId });

      if (list) {
        // Store in cache for future requests
        await cacheHelpers.set(cacheKey, list);
      }

      return list;
    } catch (error) {
      logger.error("Error getting list by ID:", error);
      throw error;
    }
  }

  static async getListByIdWithTasks(listId, userId) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.listWithTasks(listId, userId);
      const cachedList = await cacheHelpers.get(cacheKey);

      if (cachedList) {
        return cachedList;
      }

      const list = await List.findOne({ _id: listId, userId });

      if (list) {
        const tasks = await Task.find({ listId: list._id })
          .populate({
            path: 'priorityId',
            select: 'name level'
          });
        const listWithTasks = {
          ...list.toObject(),
          Tasks: tasks
        };
        
        // Store in cache for future requests
        await cacheHelpers.set(cacheKey, listWithTasks);
        return listWithTasks;
      }

      return list;
    } catch (error) {
      logger.error("Error getting list by ID with tasks:", error);
      throw error;
    }
  }

  static async updateList(listId, userId, updateData) {
    try {
      const list = await List.findOne({ _id: listId, userId });

      if (!list) {
        return false;
      }

      const updatedList = await List.findByIdAndUpdate(listId, updateData, { new: true });

      // Invalidate all affected caches
      await Promise.all([
        cacheHelpers.del(keyGenerators.list(listId, userId)),
        cacheHelpers.del(keyGenerators.listWithTasks(listId, userId)),
        cacheHelpers.del(keyGenerators.userLists(userId)),
        cacheHelpers.del(keyGenerators.userListsWithTasks(userId)),
      ]);

      return updatedList;
    } catch (error) {
      logger.error("Error updating list:", error);
      throw error;
    }
  }

  static async deleteList(listId, userId) {
    try {
      const list = await List.findOne({ _id: listId, userId });

      if (!list) {
        return false;
      }

      await List.findByIdAndDelete(listId);

      // Invalidate all affected caches
      await cacheHelpers.deleteUserCache(userId);

      return true;
    } catch (error) {
      logger.error("Error deleting list:", error);
      throw error;
    }
  }

  static async deleteAllLists(userId) {
    try {
      await List.deleteMany({ userId });

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(userId);

      return true;
    } catch (error) {
      logger.error("Error deleting all lists:", error);
      throw error;
    }
  }

  static async cleanUpList(listId, userId) {
    try {
      const list = await List.findOne({ _id: listId, userId });

      if (!list) {
        return false;
      }

      await Task.deleteMany({ listId });

      await cacheHelpers.del(keyGenerators.list(listId, userId));
      await cacheHelpers.del(keyGenerators.listWithTasks(listId, userId));
      await cacheHelpers.del(keyGenerators.userLists(userId));
      await cacheHelpers.del(keyGenerators.userListsWithTasks(userId));

      return true;
    } catch (error) {
      logger.error("Error cleaning up list:", error);
      throw error;
    }
  }

  static async cleanUpAllLists(userId) {
    try {
      // Find all lists belonging to the user
      const lists = await List.find({ userId }).select('_id');

      // Get all list IDs
      const listIds = lists.map((list) => list._id);

      if (listIds.length === 0) {
        return true;
      }

      // Delete all tasks associated with these lists
      await Task.deleteMany({
        listId: { $in: listIds }
      });

      // Invalidate all user caches
      await cacheHelpers.deleteUserCache(userId);

      return true;
    } catch (error) {
      logger.error("Error cleaning up all lists:", error);
      throw error;
    }
  }
}

module.exports = ListService;
