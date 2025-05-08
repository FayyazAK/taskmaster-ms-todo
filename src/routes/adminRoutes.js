const express = require("express");
const router = express.Router();
const {
  createPriority,
  updatePriority,
  deletePriority,
} = require("../controllers/priorityController");

// Priority routes for admin
router.post("/todo/priorities", createPriority);
router.put("/todo/priorities/:priority_id", updatePriority);
router.delete("/todo/priorities/:priority_id", deletePriority);

module.exports = router;
