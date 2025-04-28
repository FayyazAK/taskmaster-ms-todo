const express = require("express");
const router = express.Router();
const { validateRequest, authorizeAdmin } = require("../middleware/auth");
const adminRoutes = require("./adminRoutes");
const listRoutes = require("./listRoutes");
const taskRoutes = require("./taskRoutes");
const priorities = require("./priorityRoutes");

router.use("/admin", validateRequest, authorizeAdmin, adminRoutes);
router.use("/lists", validateRequest, listRoutes);
router.use("/tasks", validateRequest, taskRoutes);
router.use("/priorities", validateRequest, priorities);

module.exports = router;
