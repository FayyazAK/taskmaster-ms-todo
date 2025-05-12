const express = require("express");
const router = express.Router();
const { validateRequest, authorizeAdmin } = require("../middleware/auth");
const adminRoutes = require("./adminRoutes");
const listRoutes = require("./listRoutes");
const taskRoutes = require("./taskRoutes");
const priorities = require("./priorityRoutes");
const utilsController = require("../controllers/utilsController");
router.use("/admin", validateRequest, authorizeAdmin, adminRoutes);
router.use("/todo/lists", validateRequest, listRoutes);
router.use("/todo/tasks", validateRequest, taskRoutes);
router.use("/todo/priorities", validateRequest, priorities);
router.use(
  "/admin/todo/backup",
  validateRequest,
  authorizeAdmin,
  utilsController.backupDatabase
);
module.exports = router;
