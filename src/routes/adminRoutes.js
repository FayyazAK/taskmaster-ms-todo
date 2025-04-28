const express = require("express");
const router = express.Router();
const {
  createPriority,
  updatePriority,
  deletePriority,
} = require("../controllers/priorityController");

// Priority routes for admin
router.post("/priorities", createPriority);
router.put("/priorities/:priority_id", updatePriority);
router.delete("/priorities/:priority_id", deletePriority);

module.exports = router;
