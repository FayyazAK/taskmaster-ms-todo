/**
 * SQL Queries for User model
 */

module.exports = {
  // Table creation query with improved indexing
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50),
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_created_at (created_at),
      INDEX idx_username (username),
      INDEX idx_email (email),
      INDEX idx_role (role)
    )
  `,

  // User management queries
  CREATE_USER:
    "INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)",

  CREATE_ADMIN:
    "INSERT IGNORE INTO users (first_name, last_name, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)",

  FIND_ALL_USERS: "SELECT * FROM users WHERE role = 'user'",

  FIND_BY_USERNAME: "SELECT * FROM users WHERE username = ?",

  FIND_BY_EMAIL: "SELECT * FROM users WHERE email = ?",

  FIND_BY_ID: "SELECT * FROM users WHERE user_id = ?",

  UPDATE_USER:
    "UPDATE users SET first_name = ?, last_name = ?, username = ?, email = ?, password = ? WHERE user_id = ?",

  DELETE_USER: "DELETE FROM users WHERE user_id = ?",
};
