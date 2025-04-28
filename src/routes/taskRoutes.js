const express = require("express");
const router = express.Router();
const {
  createTask,
  getTaskById,
  getAllTasks,
  deleteTask,
  updateTaskStatus,
  updateTask,
} = require("../controllers/taskController");

// Specific routes first
router.get("/:task_id", getTaskById);
router.delete("/:task_id", deleteTask);
router.put("/:task_id", updateTask);
router.put("/:task_id/status", updateTaskStatus);

// Generic routes last
router.post("/", createTask);
router.get("/", getAllTasks);

module.exports = router;
