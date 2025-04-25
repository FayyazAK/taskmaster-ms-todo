const db = require("../config/database");
const config = require("../config/env");
const { hashPassword } = require("../utils/userUtils");
const USER = require("../queries/userQueries");
const { cacheHelpers, keyGenerators } = require("../config/redis");
const logger = require("../utils/logger");
class User {
  static async createTable() {
    try {
      await db.execute(USER.CREATE_TABLE);
    } catch (error) {
      logger.error("Error creating users table:", error);
      throw error;
    }
  }

  static async initializeAdmin() {
    try {
      const hashedPassword = await hashPassword(config.ADMIN_PASSWORD);
      const [result] = await db.execute(USER.CREATE_ADMIN, [
        config.ADMIN_FIRST_NAME,
        config.ADMIN_LAST_NAME,
        config.ADMIN_USERNAME,
        config.ADMIN_EMAIL,
        hashedPassword,
        "admin",
      ]);
    } catch (error) {
      logger.error("Error initializing admin user:", error);
      throw error;
    }
  }

  static async create({ firstName, lastName, username, email, password }) {
    const [result] = await db.execute(USER.CREATE_USER, [
      firstName,
      lastName || null,
      username,
      email,
      password,
    ]);

    // Invalidate users cache
    await cacheHelpers.del(keyGenerators.users());

    return result.insertId;
  }

  static async find() {
    // Try to get from cache first
    const cacheKey = keyGenerators.users();
    const cachedUsers = await cacheHelpers.get(cacheKey);

    if (cachedUsers) {
      return cachedUsers;
    }
    const [rows] = await db.execute(USER.FIND_ALL_USERS);

    // Store in cache for future requests
    await cacheHelpers.set(cacheKey, rows);

    return rows;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute(USER.FIND_BY_USERNAME, [username]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(USER.FIND_BY_EMAIL, [email]);
    return rows[0];
  }

  static async findById(user_id) {
    // Try to get from cache first
    const cacheKey = keyGenerators.user(user_id);
    const cachedUser = await cacheHelpers.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const [rows] = await db.execute(USER.FIND_BY_ID, [user_id]);

    // Store in cache for future requests
    await cacheHelpers.set(cacheKey, rows[0]);

    return rows[0];
  }

  static async update(
    user_id,
    { firstName, lastName, username, email, password }
  ) {
    await db.execute(USER.UPDATE_USER, [
      firstName,
      lastName,
      username,
      email,
      password,
      user_id,
    ]);

    // Invalidate users cache
    await cacheHelpers.del(keyGenerators.users());
    await cacheHelpers.del(keyGenerators.user(user_id));
  }

  static async delete(user_id) {
    await db.execute(USER.DELETE_USER, [user_id]);

    // Invalidate users cache
    await cacheHelpers.del(keyGenerators.users());
    await cacheHelpers.del(keyGenerators.user(user_id));
    await cacheHelpers.deleteUserCache(user_id);
  }
}

module.exports = User;
