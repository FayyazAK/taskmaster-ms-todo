module.exports = {
  //Generic
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD: "Password must be at least 8 characters long",
  INVALID_REQUEST: "Invalid request",
  INVALID_CREDENTIALS: "Invalid credentials",
  SERVER_RUNNING: "Server is running",
  NOT_FOUND: "Not Found - The requested resource does not exist",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  FORBIDDEN: "Forbidden - You are not authorized to access this resource",
  UNAUTHORIZED: "Unauthorized - You must be logged in to access this resource",
  SERVICE_UNAVAILABLE:
    "Service Unavailable - The server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.",

  //List
  LIST_NOT_FOUND: "List not found",
  INVALID_LIST_ID: "Invalid list ID",
  LIST_RETRIEVED: "List retrieved successfully",
  LISTS_RETRIEVED: "Lists retrieved successfully",
  LIST_CREATED: "List created successfully",
  LIST_UPDATED: "List updated successfully",
  LIST_DELETED: "List deleted successfully",
  LIST_TITLE_REQUIRED: "Title is required and must be a string",
  LIST_UPDATE_FIELDS_REQUIRED:
    "At least one field (title or description) is required",
  LIST_TITLE_LENGTH: "Title must be between 3 and 100 characters",
  LIST_DESCRIPTION_LENGTH: "Description must be between 3 and 255 characters",
  LIST_CLEANED_UP: "List cleaned up successfully",
  LISTS_CLEANED_UP: "All lists cleaned up successfully",
  LISTS_DELETED: "All lists deleted successfully",
  LIST_ID_REQUIRED: "List ID is required",

  //Task
  TASK_NOT_FOUND: "Task not found",
  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
  TASK_UPDATE_FIELDS_REQUIRED:
    "At least one field (title, description, priority_id, due_date, is_completed) is required",
  TASK_STATUS_UPDATED: "Task status updated successfully",
  TASK_UPDATE_FAILED: "Failed to update task",
  UPDATE_LIST_TIMESTAMP_FAILED: "Failed to update list timestamp",
  IS_COMPLETED_REQUIRED: "is_completed field is required",
  IS_COMPLETED_INVALID:
    "Invalid is_completed value. Must be a boolean or 0 or 1",
  INVALID_TASK_ID: "Invalid task ID",
  TASK_TITLE_REQUIRED: "Title is required and must be a string",
  TASK_TITLE_LENGTH: "Title must be between 3 and 100 characters",
  TASK_DESCRIPTION_LENGTH: "Description must be between 3 and 255 characters",
  TASK_PRIORITY_ID_REQUIRED: "Priority ID is required",
  TASK_PRIORITY_ID_INVALID: "Invalid priority ID",
  TASK_RETRIEVED: "Task retrieved successfully",
  TASKS_RETRIEVED: "Tasks retrieved successfully",
  TASK_DUE_DATE_INVALID:
    "Invalid due date. Due date must be in the format YYYY-MM-DD",

  //Priority
  PRIORITY_NOT_FOUND: "Priority not found",
  PRIORITIES_RETRIEVED: "Priorities retrieved successfully",
  PRIORITY_RETRIEVED: "Priority retrieved successfully",
  PRIORITY_CREATED: "Priority created successfully",
  PRIORITY_UPDATED: "Priority updated successfully",
  PRIORITY_DELETED: "Priority deleted successfully",
  INVALID_PRIORITY_ID: "Invalid priority ID",
  INVALID_PRIORITY_LEVEL: "Invalid priority level",
  PRIORITY_FIELDS_REQUIRED: "Name and level are required",
  PRIORITY_UPDATE_FIELDS_REQUIRED:
    "At least one field (name or level) is required",
  PRIORITY_LEVEL_EXISTS: "Priority level already exists",
  PRIORITY_DELETE_FAILED:
    "Priority cannot be deleted. It is a default priority.",
};
