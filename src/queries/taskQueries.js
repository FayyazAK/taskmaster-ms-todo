/**
 * SQL Queries for Task model
 */

module.exports = {
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS tasks (
      task_id INT AUTO_INCREMENT PRIMARY KEY,
      list_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      priority_id INT,
      due_date DATETIME,
      is_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES lists(list_id) ON DELETE CASCADE,
      FOREIGN KEY (priority_id) REFERENCES priorities(priority_id) ON DELETE SET NULL,
      INDEX idx_list_id (list_id),
      INDEX idx_priority_id (priority_id),
      INDEX idx_due_date (due_date),
      INDEX idx_is_completed (is_completed),
      INDEX idx_created_at (created_at),
      INDEX idx_updated_at (updated_at),
      INDEX idx_list_completed (list_id, is_completed)
    )
  `,

  CREATE_TASK: `
    INSERT INTO tasks (list_id, title, description, priority_id, due_date)
    VALUES (?, ?, ?, ?, ?)
  `,

  GET_ALL_TASKS: `
    SELECT t.* 
    FROM tasks t
    JOIN lists l ON t.list_id = l.list_id
    WHERE l.user_id = ?
    ORDER BY t.due_date ASC, t.created_at DESC
  `,

  GET_ALL_TASKS_WITH_STATUS: `
    SELECT t.*
    FROM tasks t
    JOIN lists l ON t.list_id = l.list_id
    WHERE l.user_id = ? AND t.is_completed = ?
    ORDER BY t.due_date ASC, t.created_at DESC
  `,

  GET_TASK_BY_ID: `
    SELECT t.* 
    FROM tasks t
    JOIN lists l ON t.list_id = l.list_id
    WHERE t.task_id = ? AND l.user_id = ?
  `,

  GET_TASKS_BY_LIST_ID: `
    SELECT t.* 
    FROM tasks t
    JOIN lists l ON t.list_id = l.list_id
    WHERE t.list_id = ? AND l.user_id = ?
    ORDER BY t.due_date ASC, t.is_completed ASC, t.created_at DESC
  `,

  DELETE_TASK: `
    DELETE t FROM tasks t
    JOIN lists l ON t.list_id = l.list_id
    WHERE t.task_id = ? AND l.user_id = ?
  `,

  UPDATE_TASK_STATUS: `
    UPDATE tasks t
    JOIN lists l ON t.list_id = l.list_id
    SET t.is_completed = ?
    WHERE t.task_id = ? AND l.user_id = ?
  `,

  UPDATE_TASK: `
    UPDATE tasks t
    JOIN lists l ON t.list_id = l.list_id
    SET t.title = ?, t.description = ?, t.priority_id = ?, t.due_date = ?
    WHERE t.task_id = ? AND l.user_id = ?
  `,

  UPDATE_LIST_TIMESTAMP: `
    UPDATE lists SET updated_at = CURRENT_TIMESTAMP WHERE list_id = ? AND user_id = ?
  `,

  GET_PENDING_TASKS: `
    SELECT t.* 
    FROM tasks t
    JOIN lists l ON t.list_id = l.list_id
    WHERE t.is_completed = 0 AND l.user_id = ?
    ORDER BY t.due_date ASC, t.created_at DESC
  `,

  GET_TASKS_DUE_TODAY: `
    SELECT t.* 
    FROM tasks t
    JOIN lists l ON t.list_id = l.list_id
    WHERE DATE(t.due_date) = CURDATE() 
    AND t.is_completed = 0
    AND l.user_id = ?
    ORDER BY t.due_date ASC
  `,

  GET_OVERDUE_TASKS: `
    SELECT t.* 
    FROM tasks t
    JOIN lists l ON t.list_id = l.list_id
    WHERE t.due_date < CURDATE() 
    AND t.is_completed = 0
    AND l.user_id = ?
    ORDER BY t.due_date ASC
  `,
};
