const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/userController");

// User routes for user
router.put("/update-profile", updateProfile);

module.exports = router;
