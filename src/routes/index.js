const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const authRoutes = require("./authRoutes");
const { validateRequest } = require("../middleware/auth");

router.use("/auth", authRoutes);
router.use("/admin", validateRequest, adminRoutes);
router.use("/user", validateRequest, userRoutes);

module.exports = router;
