/**
 * SQL Queries for Priority model
 */

module.exports = {
  // Table creation query
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS priorities (
      priority_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(20) NOT NULL,
      level INT NOT NULL UNIQUE
    )
  `,

  // Initialize priorities
  INITIALIZE_PRIORITIES: `
    INSERT IGNORE INTO priorities (name, level) VALUES 
    ('Low', 1),
    ('Medium', 2),
    ('High', 3),
    ('Urgent', 4)
  `,

  // Get all priorities
  GET_PRIORITIES: `
    SELECT * FROM priorities
    ORDER BY level ASC
  `,

  // Get priority by ID
  GET_PRIORITY_BY_ID: `
    SELECT * FROM priorities
    WHERE priority_id = ?
  `,

  // Get priority by level
  GET_PRIORITY_BY_LEVEL: `
    SELECT priority_id, name, level
    FROM priorities
    WHERE level = ?
  `,
  // Create a new priority
  CREATE_PRIORITY: `
    INSERT INTO priorities (name, level) 
    VALUES (?, ?)
  `,

  // Update a priority
  UPDATE_PRIORITY: `
    UPDATE priorities 
    SET name = ?, level = ?
    WHERE priority_id = ?
  `,

  // Delete a priority
  DELETE_PRIORITY: `
    DELETE FROM priorities
    WHERE priority_id = ?
  `,

  // Check if level exists
  CHECK_LEVEL_EXISTS: `
    SELECT COUNT(*) as count
    FROM priorities
    WHERE level = ? AND priority_id != ?
  `,
};
