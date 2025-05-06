const { Priority } = require("../models");
const { cacheHelpers, keyGenerators } = require("../config/redis");
const logger = require("../utils/logger");

class PriorityService {
  static async initializePriorities() {
    try {
      const defaultPriorities = [
        { name: "Low", level: 1 },
        { name: "Medium", level: 2 },
        { name: "High", level: 3 },
        { name: "Urgent", level: 4 },
      ];

      await Priority.bulkCreate(defaultPriorities, {
        ignoreDuplicates: true,
      });

      logger.info("Priority levels initialized successfully");
    } catch (error) {
      logger.error("Error initializing priority levels:", error);
      throw error;
    }
  }

  static async getPriorities() {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.priorities();
      const cachedPriorities = await cacheHelpers.get(cacheKey);

      if (cachedPriorities) {
        return cachedPriorities;
      }

      const priorities = await Priority.findAll({
        order: [["level", "ASC"]],
      });

      // Store in cache for future requests
      await cacheHelpers.set(cacheKey, priorities);

      return priorities;
    } catch (error) {
      logger.error("Error getting priorities:", error);
      throw error;
    }
  }

  static async getPriorityById(priorityId) {
    try {
      // Try to get from cache first
      const cacheKey = keyGenerators.priority(priorityId);
      const cachedPriority = await cacheHelpers.get(cacheKey);

      if (cachedPriority) {
        return cachedPriority;
      }

      const priority = await Priority.findByPk(priorityId);

      if (priority) {
        // Store in cache for future requests
        await cacheHelpers.set(cacheKey, priority);
      }

      return priority;
    } catch (error) {
      logger.error("Error getting priority by ID:", error);
      throw error;
    }
  }

  static async getPriorityByLevel(level) {
    try {
      const priority = await Priority.findOne({
        where: { level },
      });

      return priority;
    } catch (error) {
      logger.error("Error getting priority by level:", error);
      throw error;
    }
  }

  static async createPriority(name, level) {
    try {
      // Check if level already exists
      const existingPriority = await this.getPriorityByLevel(level);
      if (existingPriority) {
        throw new Error("Priority level already exists");
      }

      const priority = await Priority.create({
        name,
        level,
      });

      // Invalidate all caches for priorities and all user caches
      await Promise.all([
        cacheHelpers.del(keyGenerators.priorities()),
        cacheHelpers.clearAllListsAndTasks(),
      ]);

      return priority.priorityId;
    } catch (error) {
      logger.error("Error creating priority:", error);
      throw error;
    }
  }

  static async updatePriority(priorityId, name, level) {
    try {
      const priority = await Priority.findByPk(priorityId);
      if (!priority) {
        throw new Error("Priority not found");
      }

      // Check if new level conflicts with existing priority
      if (level !== priority.level) {
        const existingPriority = await this.getPriorityByLevel(level);
        if (existingPriority) {
          throw new Error("Priority level already exists");
        }
      }

      await priority.update({
        name,
        level,
      });

      // Invalidate all caches for priorities and all user caches
      await Promise.all([
        cacheHelpers.del(keyGenerators.priorities()),
        cacheHelpers.del(keyGenerators.priority(priorityId)),
        cacheHelpers.clearAllListsAndTasks(),
      ]);

      return true;
    } catch (error) {
      logger.error("Error updating priority:", error);
      throw error;
    }
  }

  static async deletePriority(priorityId) {
    try {
      const priority = await Priority.findByPk(priorityId);
      if (!priority) {
        throw new Error("Priority not found");
      }

      await priority.destroy();

      // Invalidate all caches for priorities and all user caches
      await Promise.all([
        cacheHelpers.del(keyGenerators.priorities()),
        cacheHelpers.del(keyGenerators.priority(priorityId)),
        cacheHelpers.clearAllListsAndTasks(),
      ]);

      return true;
    } catch (error) {
      logger.error("Error deleting priority:", error);
      throw error;
    }
  }
}

module.exports = PriorityService;
