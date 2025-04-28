/**
 * SQL Queries for List model
 */
module.exports = {
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS lists (
      list_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_created_at (created_at),
      INDEX idx_updated_at (updated_at)
    )
  `,

  CREATE_LIST: `
    INSERT INTO lists (user_id, title, description)
    VALUES (?, ?, ?)
  `,

  GET_LISTS_BY_USER_ID: `
  SELECT 
    l.list_id, 
    l.title, 
    l.description, 
    l.created_at, 
    l.updated_at,
    COUNT(t.task_id) as total_tasks,
    SUM(IF(t.is_completed = 0, 1, 0)) as pending_tasks
  FROM lists l
  LEFT JOIN tasks t ON l.list_id = t.list_id
  WHERE l.user_id = ?
  GROUP BY l.list_id
  ORDER BY l.created_at DESC
`,

  GET_LIST_BY_ID: `
  SELECT 
    list_id,
    title, 
    description, 
    created_at, 
    updated_at
  FROM lists 
  WHERE list_id = ? AND user_id = ?
`,

  DELETE_LIST: `
  DELETE FROM lists 
  WHERE list_id = ? AND user_id = ?
`,

  DELETE_ALL_LISTS: `
  DELETE FROM lists 
  WHERE user_id = ?
`,

  CLEAN_UP_LIST: `
  DELETE FROM tasks 
  WHERE list_id = ?
`,

  CLEAN_UP_ALL_LISTS: `
  DELETE t FROM tasks t
  JOIN lists l ON t.list_id = l.list_id
  WHERE l.user_id = ?
`,

  UPDATE_LIST_TIMESTAMP: `
  UPDATE lists SET updated_at = CURRENT_TIMESTAMP WHERE list_id = ? AND user_id = ?
`,
};
