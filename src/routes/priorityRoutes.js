const express = require("express");
const router = express.Router();
const {
  getAllPriorities,
  getPriorityById,
  getPriorityByLevel,
} = require("../controllers/priorityController");

// User+Admin routes
router.get("/", getAllPriorities);
router.get("/id/:priority_id", getPriorityById);
router.get("/level/:level", getPriorityByLevel);

module.exports = router;
